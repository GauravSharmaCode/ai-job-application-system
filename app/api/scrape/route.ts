import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeJob } from "@/lib/scraper";
import { interpretJD } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const Body = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { url } = Body.parse(json);

    const scraped = await scrapeJob(url);
    const jd = await interpretJD(scraped.description || scraped.rawHTML || "");

    // Upsert job record
    const job = await prisma.job.upsert({
      where: { url },
      update: {
        platform: scraped.platform,
        title: scraped.title,
        company: scraped.company,
        location: scraped.location,
        experience: scraped.experience ?? undefined,
        description: scraped.description,
        skills: scraped.skills ?? [],
        jdSchema: jd as Prisma.InputJsonValue,
      },
      create: {
        url,
        platform: scraped.platform,
        title: scraped.title,
        company: scraped.company,
        location: scraped.location,
        experience: scraped.experience ?? undefined,
        description: scraped.description,
        skills: scraped.skills ?? [],
        jdSchema: jd as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ job, scraped, jd });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
