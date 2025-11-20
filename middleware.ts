import { NextRequest, NextResponse } from "next/server";
import { logger } from "./lib/logger";

// Public paths that don't require auth
const PUBLIC_PATHS = [
  "/",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/public",
];

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const { pathname } = req.nextUrl;
  const method = req.method;
  const userAgent = req.headers.get("user-agent") || "";
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

  // Allow public assets and health
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const response = NextResponse.next();
    
    // Log API requests only
    if (pathname.startsWith("/api")) {
      const duration = Date.now() - startTime;
      logger.info(`${method} ${pathname}`, {
        method,
        url: pathname,
        statusCode: 200,
        duration,
        userAgent,
        ip,
        public: true
      });
    }
    
    return response;
  }

  // Only protect API routes for now
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const headerToken = req.headers.get("authorization") || req.headers.get("x-api-key");
  const expected = process.env.STATIC_TOKEN;

  if (!expected) {
    const duration = Date.now() - startTime;
    logger.error(`${method} ${pathname} - Server misconfigured`, {
      method,
      url: pathname,
      statusCode: 500,
      duration,
      userAgent,
      ip,
      error: "STATIC_TOKEN not set"
    });
    return new NextResponse("Server misconfigured: STATIC_TOKEN not set", { status: 500 });
  }

  if (!headerToken) {
    const duration = Date.now() - startTime;
    logger.warn(`${method} ${pathname} - Unauthorized`, {
      method,
      url: pathname,
      statusCode: 401,
      duration,
      userAgent,
      ip,
      error: "No token provided"
    });
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Support either bare token or Bearer token
  const token = headerToken.startsWith("Bearer ") ? headerToken.slice(7) : headerToken;
  if (token !== expected) {
    const duration = Date.now() - startTime;
    logger.warn(`${method} ${pathname} - Forbidden`, {
      method,
      url: pathname,
      statusCode: 403,
      duration,
      userAgent,
      ip,
      error: "Invalid token"
    });
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Log successful authenticated request
  const duration = Date.now() - startTime;
  logger.info(`${method} ${pathname}`, {
    method,
    url: pathname,
    statusCode: 200,
    duration,
    userAgent,
    ip,
    authenticated: true
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
