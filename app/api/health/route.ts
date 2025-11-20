import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  return NextResponse.json({ ok: true, ts: Date.now() });
});
