export async function POST(request) {
  const { language, code } = await request.json();
  // Mock execution
  const result = {
    status: "Accepted",
    output: `Executed ${language} code successfully. Code length: ${code?.length || 0}`,
    language
  };
  return Response.json(result);
}