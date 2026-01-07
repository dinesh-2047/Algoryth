import { NextResponse } from "next/server";
import { problems } from "../../../lib/problems";
import { withErrorHandler, createSuccessResponse, APIError } from "../../../lib/api-utils";

export const GET = withErrorHandler(async (req) => {
  try {
    // Validate that problems data exists
    if (!problems || !Array.isArray(problems)) {
      throw new APIError("Problems data is unavailable", 503, "SERVICE_UNAVAILABLE");
    }

    const list = problems.map((p) => {
      // Validate required fields
      if (!p.id || !p.slug || !p.title) {
        console.warn(`Problem ${p.id || 'unknown'} is missing required fields`);
        return null;
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty || "Unknown",
        tags: Array.isArray(p.tags) ? p.tags : [],
      };
    }).filter(Boolean); // Remove null entries

    const meta = {
      total: list.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(createSuccessResponse(list, { meta }));
  } catch (error) {
    // Re-throw to be handled by withErrorHandler
    throw error;
  }
});
