import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { language, problemId } = await request.json();

    // TODO: Implement submission logic
    // For now, just return a mock response
    const mockResponse = {
      status: 'accepted',
      message: 'Submission received',
      problemId,
      language,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Failed to submit code' }, { status: 500 });
  }
}
