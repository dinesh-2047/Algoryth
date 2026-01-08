export async function POST(request) {
  const { language } = await request.json();
  // Mock execution
  const result = {
    status: "Accepted",
    output: `Executed ${language} code successfully`,
    language
  };
  return Response.json(result);
}