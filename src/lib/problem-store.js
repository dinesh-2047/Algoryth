import { connectToDatabase } from "./db/connect";
import Problem from "./db/models/Problem";
import { problemSeedData } from "./problemSeedData";

let seedPromise = null;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeProblem(problem, { includeTestCases = false } = {}) {
  const p = typeof problem?.toObject === "function" ? problem.toObject() : problem;
  if (!p) return null;

  const normalized = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    rating: p.rating,
    difficulty: p.difficulty,
    tags: p.tags || [],
    statement: p.statement,
    inputFormat: p.inputFormat || "",
    outputFormat: p.outputFormat || "",
    constraints: p.constraints || [],
    examples: p.examples || [],
    hints: p.hints || [],
    starterCode: p.starterCode || {},
    isPublic: p.isPublic !== false,
    editorial: p.editorial || { title: "", content: "", updatedAt: null, updatedBy: null },
    acceptanceRate: typeof p.acceptanceRate === "number" ? p.acceptanceRate : 0,
    submissions: typeof p.submissionsCount === "number" ? p.submissionsCount : 0,
  };

  if (includeTestCases) {
    normalized.testCases = p.testCases || [];
  }

  return normalized;
}

function getSortSpec(sort) {
  if (sort === "difficulty" || sort === "rating") return { rating: 1, title: 1 };
  return { title: 1 };
}

function difficultyToRange(difficulty) {
  if (difficulty === "Easy") return { $lt: 1300 };
  if (difficulty === "Medium") return { $gte: 1300, $lt: 1900 };
  if (difficulty === "Hard") return { $gte: 1900 };
  return null;
}

function localFilterAndSort({ search = "", difficulty, tags = [], sort = "title", includePrivate = false } = {}) {
  const searchLower = search.toLowerCase();
  const hasSearch = Boolean(searchLower);

  const filtered = problemSeedData.filter((problem) => {
    if (!includePrivate && problem.isPublic === false) {
      return false;
    }

    if (hasSearch) {
      const searchable = `${problem.title} ${problem.statement} ${(problem.tags || []).join(" ")}`.toLowerCase();
      if (!searchable.includes(searchLower)) return false;
    }

    if (difficulty) {
      if (difficulty === "Easy" && problem.rating >= 1300) return false;
      if (difficulty === "Medium" && (problem.rating < 1300 || problem.rating >= 1900)) return false;
      if (difficulty === "Hard" && problem.rating < 1900) return false;
    }

    if (tags.length > 0) {
      const tagSet = new Set(problem.tags || []);
      if (!tags.some((tag) => tagSet.has(tag))) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (sort === "difficulty" || sort === "rating") {
      if (a.rating === b.rating) return a.title.localeCompare(b.title);
      return a.rating - b.rating;
    }
    return a.title.localeCompare(b.title);
  });

  return filtered.map((problem) => normalizeProblem(problem));
}

async function seedProblemsInDatabase() {
  if (!process.env.MONGODB_URI) {
    return false;
  }

  await connectToDatabase();

  const operations = problemSeedData.map((problem) => ({
    updateOne: {
      filter: { slug: problem.slug },
      update: {
        $setOnInsert: {
          id: problem.id,
          slug: problem.slug,
          title: problem.title,
          rating: problem.rating,
          difficulty: problem.difficulty,
          tags: problem.tags,
          statement: problem.statement,
          inputFormat: problem.inputFormat,
          outputFormat: problem.outputFormat,
          constraints: problem.constraints,
          examples: problem.examples,
          hints: problem.hints,
          starterCode: problem.starterCode,
          testCases: problem.testCases,
          isPublic: true,
          editorial: {
            title: "",
            content: "",
            updatedAt: null,
            updatedBy: null,
          },
          submissionsCount: 0,
          acceptedCount: 0,
          acceptanceRate: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Problem.bulkWrite(operations, { ordered: false });
  }

  return true;
}

export async function ensureProblemsSeeded() {
  if (!process.env.MONGODB_URI) {
    return false;
  }

  if (!seedPromise) {
    seedPromise = seedProblemsInDatabase().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

export async function getProblems({ search = "", difficulty, tags = [], sort = "title", includePrivate = false } = {}) {
  const sanitizedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];

  if (!process.env.MONGODB_URI) {
    return localFilterAndSort({
      search,
      difficulty,
      tags: sanitizedTags,
      sort,
      includePrivate,
    });
  }

  try {
    await ensureProblemsSeeded();

    const query = {};

    if (search) {
      const regex = new RegExp(escapeRegExp(search), "i");
      query.$or = [
        { title: regex },
        { statement: regex },
        { tags: regex },
      ];
    }

    if (difficulty) {
      const range = difficultyToRange(difficulty);
      if (range) {
        query.rating = range;
      }
    }

    if (sanitizedTags.length > 0) {
      query.tags = { $in: sanitizedTags };
    }

    if (!includePrivate) {
      query.isPublic = true;
    }

    const docs = await Problem.find(query)
      .select({
        id: 1,
        slug: 1,
        title: 1,
        rating: 1,
        difficulty: 1,
        tags: 1,
        statement: 1,
        isPublic: 1,
        acceptanceRate: 1,
        submissionsCount: 1,
      })
      .sort(getSortSpec(sort))
      .lean();

    return docs.map((doc) => normalizeProblem(doc));
  } catch (error) {
    console.error("Failed to fetch problems from database, using fallback:", error);
    return localFilterAndSort({
      search,
      difficulty,
      tags: sanitizedTags,
      sort,
      includePrivate,
    });
  }
}

export async function getProblemBySlug(
  slug,
  { includeTestCases = false, includePrivate = false } = {}
) {
  if (!slug) return null;

  if (!process.env.MONGODB_URI) {
    const localProblem = problemSeedData.find((problem) => problem.slug === slug);
    if (!includePrivate && localProblem?.isPublic === false) {
      return null;
    }
    return normalizeProblem(localProblem, { includeTestCases });
  }

  try {
    await ensureProblemsSeeded();

    const projection = includeTestCases
      ? {}
      : {
          testCases: 0,
        };

    const query = includePrivate ? { slug } : { slug, isPublic: true };
    const problem = await Problem.findOne(query, projection).lean();

    if (!problem) return null;

    return normalizeProblem(problem, { includeTestCases });
  } catch (error) {
    console.error("Failed to fetch problem by slug from database, using fallback:", error);
    const localProblem = problemSeedData.find((problem) => problem.slug === slug);
    if (!includePrivate && localProblem?.isPublic === false) {
      return null;
    }
    return normalizeProblem(localProblem, { includeTestCases });
  }
}

export async function recordProblemSubmission(problemSlug, isAccepted) {
  if (!process.env.MONGODB_URI || !problemSlug) {
    return;
  }

  try {
    await ensureProblemsSeeded();

    const inc = {
      submissionsCount: 1,
      acceptedCount: isAccepted ? 1 : 0,
    };

    const updated = await Problem.findOneAndUpdate(
      { slug: problemSlug },
      { $inc: inc },
      { new: true }
    ).select({ submissionsCount: 1, acceptedCount: 1 });

    if (!updated || updated.submissionsCount <= 0) return;

    const acceptanceRate = Number(
      ((updated.acceptedCount / updated.submissionsCount) * 100).toFixed(2)
    );

    await Problem.updateOne({ slug: problemSlug }, { $set: { acceptanceRate } });
  } catch (error) {
    console.error("Failed to update problem submission stats:", error);
  }
}

export function getSeededProblemCount() {
  return problemSeedData.length;
}
