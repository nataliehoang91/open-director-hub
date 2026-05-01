import { NextResponse } from "next/server";
import { getReleaseDetail } from "@/lib/releases";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = await getReleaseDetail(id);
  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(release);
}
