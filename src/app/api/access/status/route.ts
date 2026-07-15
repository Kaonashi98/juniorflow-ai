import { NextResponse } from "next/server";
import { isRequestUnlocked } from "@/lib/access.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return NextResponse.json({ unlocked: isRequestUnlocked(request) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ unlocked: false }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}