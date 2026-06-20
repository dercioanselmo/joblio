import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Minimal endpoint to satisfy SDK refresh calls during development.
  // A full implementation should validate and refresh session tokens via InsForge.
  return NextResponse.json({ refreshed: true });
}
