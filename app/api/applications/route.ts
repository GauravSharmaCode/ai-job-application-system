import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";
import type { ApplicationStatus } from "@prisma/client";

const CreateBody = z.object({
  jobUrl: z.string().url(),
  platform: z.string(),
  resumeId: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["SAVED","APPLIED","IN_PROGRESS","IN_REVIEW","REJECTED","GHOSTED","SHORTLISTED"]).optional(),
});

export const GET = withLogging(async (req: NextRequest) => {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: true, resume: true },
  });
  return NextResponse.json({ applications });
});

export const POST = withLogging(async (req: NextRequest) => {
  const json = await req.json();
  const body = CreateBody.parse(json);
  const job = await prisma.job.findUnique({ where: { url: body.jobUrl } });
  if (!job) {
    return NextResponse.json({ error: "Job not found. Scrape it first." }, { status: 400 });
  }
  const app = await prisma.application.create({
    data: {
      jobId: job.id,
      platform: body.platform,
      resumeId: body.resumeId,
      notes: body.notes,
      status: (body.status as ApplicationStatus) ?? undefined,
    },
    include: { job: true, resume: true },
  });
  return NextResponse.json({ application: app });
});
