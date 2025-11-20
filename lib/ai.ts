// Gemini (Google Generative AI) SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

export type JDSchema = {
  role?: string;
  requiredSkills?: string[];
  responsibilities?: string[];
  keywords?: string[];
  seniority?: string;
};

export type TailoredResume = {
  summary: string;
  skills: string[];
  bullets: string[];
  coverLetter?: string;
};

// Lazy Gemini client accessor (not invoked by default; stubs below avoid external calls)
export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch {
    return null;
  }
}

export async function interpretJD(htmlOrText: string): Promise<JDSchema> {
  // Minimal placeholder implementation to satisfy module creation
  // In production, call LLM to parse the JD
  if (!htmlOrText) return {};
  const text = htmlOrText.replace(/<[^>]+>/g, " ").slice(0, 4000);
  // Very naive parsing placeholder
  return {
    role: /\b(developer|engineer|manager|designer)\b/i.exec(text)?.[0],
    requiredSkills: Array.from(new Set((text.match(/\b(java|python|react|node|aws|sql)\b/gi) || []).map(s => s.toLowerCase()))),
    responsibilities: [],
    keywords: [],
  };
}

export async function tailorResume(jd: JDSchema, base: { summary?: string; skills?: string[] }): Promise<TailoredResume> {
  // Placeholder deterministic tailoring; avoids making external calls in dev.
  const mergedSkills = Array.from(new Set([...(base.skills || []), ...(jd.requiredSkills || [])]));
  const summary = `Candidate with experience relevant to ${jd.role ?? "the role"}. Key skills: ${mergedSkills.join(", ")}.`;
  const bullets = mergedSkills.slice(0, 6).map((s) => `Demonstrated proficiency with ${s}.`);
  return { summary, skills: mergedSkills, bullets };
}
