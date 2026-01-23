import { NextResponse } from "next/server";
import { createSuccessResponse, logApiRequest } from "../../../lib/api-utils";

export function GET() {
  logApiRequest('GET', '/api/health');
  return createSuccessResponse({
    ok: true,
    service: "algoryth",
    timestamp: Date.now()
  });
}
