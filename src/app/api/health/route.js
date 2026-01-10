import { NextResponse } from "next/server";
import { withErrorHandler, createSuccessResponse } from "../../../lib/api-utils";

export const GET = withErrorHandler(async () => {
  // Simulate some basic health checks
  const healthData = {
    ok: true,
    service: "algoryth",
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  };

  return NextResponse.json(createSuccessResponse(healthData));
});
