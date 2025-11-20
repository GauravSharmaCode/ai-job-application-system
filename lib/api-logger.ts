import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.nextUrl.pathname;
    
    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;
      
      logger.info(`${method} ${url} - ${response.status}`, {
        method,
        url,
        statusCode: response.status,
        duration,
        success: true
      });
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`${method} ${url} - Error: ${errorMessage}`, {
        method,
        url,
        statusCode: 500,
        duration,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}