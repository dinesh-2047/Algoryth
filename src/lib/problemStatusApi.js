/**
 * Fetch all problem statuses for logged-in user
 * @returns {Promise<Object>} Status map: { problemId: "Solved" | "Attempted" | "Unsolved" }
 */
export async function fetchProblemStatuses() {
  const token = localStorage.getItem("algoryth_token");
  if (!token) return {};

  try {
    const response = await fetch("/api/problemStatus", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return {};

    const { statuses } = await response.json();
    return statuses || {};
  } catch (error) {
    console.error("Failed to fetch problem statuses:", error);
    return {};
  }
}

/**
 * Get status for a specific problem
 * @param {string} problemId 
 * @param {string} problemSlug 
 * @param {Object} statusMap 
 * @returns {"Solved" | "Attempted" | null}
 */
export function getProblemStatus(problemId, problemSlug, statusMap) {
  if (!statusMap) return null;
  
  const status = statusMap[problemId] || statusMap[problemSlug];
  
  // Only return Solved or Attempted, ignore Unsolved
  return status === "Solved" || status === "Attempted" ? status : null;
}
