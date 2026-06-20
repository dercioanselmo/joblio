import Image from "next/image";

export function Testimonial() {
  return (
    <section className="border-x border-b border-border bg-surface px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28">
      <p className="text-[18px] font-semibold uppercase leading-7 tracking-[0.16em] text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[1120px] text-[34px] font-semibold leading-[1.35] tracking-normal text-text-darker sm:text-[44px] lg:text-[52px]">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my dashboard to
        see interviews waiting. It feels like cheating. Had 3 offers on the table
        simultaneously.&rdquo;
      </blockquote>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={64}
          height={64}
          className="rounded-md"
        />
        <div className="text-left">
          <p className="text-[20px] font-bold leading-7 text-text-black">Tom Wilson</p>
          <p className="text-[18px] font-normal leading-7 text-text-slate-medium">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}
