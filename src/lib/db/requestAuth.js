import { connectToDatabase } from "./connect";
import User from "./models/User";
import { verifyToken } from "./middleware";

function extractBearerToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

export function getAuthenticatedUserId(request) {
  const token = extractBearerToken(request);
  if (!token) return null;

  const { valid, decoded } = verifyToken(token);
  if (!valid || !decoded?.userId) return null;

  return decoded.userId;
}

export async function requireAuthenticatedUser(request) {
  const token = extractBearerToken(request);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Authorization token is required",
    };
  }

  const { valid, decoded } = verifyToken(token);
  if (!valid || !decoded?.userId) {
    return {
      ok: false,
      status: 401,
      error: "Invalid or expired token",
    };
  }

  await connectToDatabase();
  const user = await User.findById(decoded.userId).select("-password").lean();

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "User not found",
    };
  }

  return {
    ok: true,
    user,
    userId: String(user._id),
    decoded,
  };
}

export async function requireAdminUser(request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth;

  if (auth.user.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "Admin access required",
    };
  }

  return auth;
}
