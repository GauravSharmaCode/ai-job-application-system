import { NextResponse } from "next/server";
import { z } from "zod";
import { tailorResume, JDSchema } from "@/lib/ai";

const Body = z.object({
  jd: z.object({}).passthrough(),
  base: z.object({ summary: z.string().optional(), skills: z.array(z.string()).optional() }),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { jd, base } = Body.parse(json);
    const tailored = await tailorResume(jd as JDSchema, base);
    return NextResponse.json({ tailored });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
