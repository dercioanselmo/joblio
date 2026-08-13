import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

// emprego.co.mz has no public API (confirmed: no API/RSS/dev docs on the
// site). It's plain server-rendered WordPress HTML, so a plain fetch + HTML
// parse is enough — no Browserbase/Stagehand needed. See
// docs/specs/0002-emprego-job-discovery.md for the full design record.

const BASE_URL = "https://www.emprego.co.mz";

// A descriptive UA identifying this as a bot, per good scraping etiquette —
// robots.txt (checked directly) disallows only admin/system paths, not the
// search/vaga pages this needs, and specifies no crawl-delay.
const USER_AGENT = "Mozilla/5.0 (compatible; JoblioBot/1.0; +https://joblio.app)";

export type EmpregoSearchResult = {
  title: string;
  companyName: string;
  location: string;
  detailUrl: string;
  isExpired: boolean;
};

export type EmpregoJobDetail = {
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error("[lib/emprego] fetch failed", url, error);
    return null;
  }
}

// The site redirects a plain ?s= query to /pesquisa/{slug}/, with words
// joined by "+" (confirmed by following the real redirect for a multi-word
// query) — constructing the target URL directly skips that redirect hop.
function buildSearchSlug(jobTitle: string): string {
  return jobTitle
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => encodeURIComponent(word))
    .join("+");
}

export function searchResultsUrl(jobTitle: string, page: number): string {
  const slug = buildSearchSlug(jobTitle);
  return page <= 1
    ? `${BASE_URL}/pesquisa/${slug}/`
    : `${BASE_URL}/pesquisa/${slug}/page/${page}/`;
}

// Returns null (not an empty array) when the fetch itself failed, so the
// caller can log AC-8's "possible parser breakage" warning only when a page
// loaded successfully but parsed to zero rows — a real structural change,
// not a network hiccup or a genuinely empty page.
export async function fetchSearchResultsPage(
  jobTitle: string,
  page: number,
): Promise<EmpregoSearchResult[] | null> {
  const html = await fetchHtml(searchResultsUrl(jobTitle, page));
  if (html === null) return null;

  const $ = cheerio.load(html);
  const rows = $(".content-display li.clearfix");

  return rows
    .map((_, row): EmpregoSearchResult | null => {
      const $row = $(row);
      const titleLink = $row.find("h3.normal-text a").first();
      const title = titleLink.text().trim();
      const detailUrl = titleLink.attr("href")?.trim() ?? "";
      const companyName = $row.find(".col-65-10 a.companylink").first().text().trim();
      const location = $row.find(".col-15-10 a").first().text().trim();
      const validity = $row.find(".col-1-7").first().text().trim();

      if (!title || !detailUrl) return null;

      return {
        title,
        companyName: companyName || "Unknown",
        location,
        detailUrl,
        // The site marks an expired posting with the literal text
        // "Expirado" in this column; anything else is a validity date
        // (e.g. "17.08.2026") — confirmed against real listing/category
        // pages, both forms observed directly.
        isExpired: validity.toLowerCase() === "expirado",
      };
    })
    .get()
    .filter((result): result is EmpregoSearchResult => result !== null);
}

// Job pages don't use one consistent heading level for every section (some
// use <h5>, some <h6>, confirmed by comparing two real postings), so this
// matches by heading text, not tag name.
function extractListAfterHeading(
  $: cheerio.CheerioAPI,
  container: cheerio.Cheerio<AnyNode>,
  headingText: string,
): string[] {
  const heading = container
    .find("h5, h6")
    .filter((_, el) => $(el).text().trim().toLowerCase() === headingText.toLowerCase())
    .first();
  if (heading.length === 0) return [];

  const list = heading.next("ul");
  if (list.length === 0) return [];

  return list
    .find("> li")
    .map((_, li) => $(li).text().trim())
    .get()
    .filter(Boolean);
}

// Returns null when the fetch failed OR the page didn't have the expected
// content container (AC-4's per-job fallback and AC-8's parser-breakage
// signal both key off this).
export async function fetchJobDetail(detailUrl: string): Promise<EmpregoJobDetail | null> {
  const html = await fetchHtml(detailUrl);
  if (html === null) return null;

  const $ = cheerio.load(html);
  const container = $(".content-vacancy .medium-large-text").first();
  if (container.length === 0) return null;

  // The intro paragraph (about_role) is the loose text directly inside this
  // container, before any of its <h5>/<h6> subsections — strip those out
  // and what's left is the intro.
  const introOnly = container.clone();
  introOnly.find("h5, h6, ul").remove();
  const aboutRole = introOnly.text().trim();

  const responsibilities = extractListAfterHeading($, container, "Funções");
  const requirements = extractListAfterHeading($, container, "Requisitos");

  if (!aboutRole && responsibilities.length === 0 && requirements.length === 0) {
    return null;
  }

  return { aboutRole, responsibilities, requirements };
}
