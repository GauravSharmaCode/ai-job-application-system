import { chromium, Browser, Page } from "playwright";

export type ScrapedJob = {
  url: string;
  platform: "linkedin" | "naukri" | "indeed" | "unknown";
  title?: string;
  company?: string;
  location?: string;
  experience?: string;
  description?: string;
  skills?: string[];
  rawHTML?: string;
};

function detectPlatform(url: string): ScrapedJob["platform"] {
  try {
    const u = new URL(url);
    if (u.host.includes("linkedin")) return "linkedin";
    if (u.host.includes("naukri")) return "naukri";
    if (u.host.includes("indeed")) return "indeed";
  } catch {}
  return "unknown";
}

export async function scrapeJob(url: string): Promise<ScrapedJob> {
  const platform = detectPlatform(url);
  const result: ScrapedJob = { url, platform };

  let browser: Browser | null = null;
  let page: Page | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });

    // Attempt to scroll for dynamic content
    await autoScroll(page);

    const html = await page.content();
    result.rawHTML = html;

    // Very loose selectors as placeholders; robust ones can be added per platform.
    result.title = (await page.locator("h1, h2").first().textContent())?.trim() || undefined;
    result.company = (await page.locator("[data-company], .company, .icl-u-lg-mr--sm").first().textContent())?.trim() || undefined;
    result.location = (await page.locator("[data-location], .location, .jobsearch-DesktopStickyContainer-subtitle").first().textContent())?.trim() || undefined;
    result.description = (await page.locator("article, .description, #jobDescriptionText").first().innerText())?.trim() || undefined;
    // naive skill extraction from visible text
    const text = await page.textContent("body");
    if (text) {
      const skills = Array.from(new Set((text.match(/\b(java|python|react|node|aws|sql|typescript|docker|kubernetes)\b/gi) || []).map(s => s.toLowerCase())));
      if (skills.length) result.skills = skills;
    }
  } catch (err) {
    // Attach minimal error info; callers can log
    throw new Error(`Scrape failed: ${(err as Error).message}`);
  } finally {
    await page?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }

  return result;
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let total = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const { scrollHeight } = document.documentElement;
        window.scrollBy(0, distance);
        total += distance;
        if (total >= scrollHeight * 1.2) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}
