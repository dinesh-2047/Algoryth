import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";
import { connectToDatabase } from "../../../lib/db/connect";
import Submission from "../../../lib/db/models/Submission";
import { verifyToken } from "../../../lib/db/middleware";

export async function POST(request) {
  try {
    const { slug, code, language = 'javascript' } = await request.json();
    
    // Get user ID from JWT token
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { valid, decoded } = verifyToken(token);
        if (valid) {
          userId = decoded.userId;
        }
      }
    }

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { verdict: "Error", message: "Empty code" },
        { status: 400 }
      );
    }

    const problem = getProblemBySlug(slug);

    if (!problem || !problem.testCases) {
      return NextResponse.json(
        { verdict: "Error", message: "Problem or test cases not found" },
        { status: 404 }
      );
    }

    let userFunction;

    try {
      // User must define solve(input)
      userFunction = new Function(
        `${code}; return solve;`
      )();
    } catch (err) {
      // Save failed submission to database
      if (userId) {
        try {
          await connectToDatabase();
          
          const submission = new Submission({
            userId,
            problemSlug: slug,
            problemId: problem.id,
            problemTitle: problem.title,
            code,
            language,
            verdict: "Compilation Error",
            difficulty: problem.difficulty,
            submittedAt: new Date(),
          });
          
          await submission.save();
        } catch (dbError) {
          console.error('Error saving compilation error to database:', dbError);
        }
      }
      
      return NextResponse.json({
        verdict: "Compilation Error",
        error: err.toString(),
      });
    }

    for (const test of problem.testCases) {
      let userOutput;

      try {
        userOutput = userFunction(JSON.parse(test.input));
      } catch (err) {
        // Save Runtime Error to database
        if (userId) {
          try {
            await connectToDatabase();
            
            const submission = new Submission({
              userId,
              problemSlug: slug,
              problemId: problem.id,
              problemTitle: problem.title,
              code,
              language,
              verdict: "Runtime Error",
              difficulty: problem.difficulty,
              submittedAt: new Date(),
            });
            
            await submission.save();
          } catch (dbError) {
            console.error('Error saving runtime error to database:', dbError);
          }
        }
        
        return NextResponse.json({
          verdict: "Runtime Error",
          error: err.toString(),
        });
      }

      const expected = JSON.stringify(
        JSON.parse(test.output)
      );

      const actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        // Save Wrong Answer to database
        if (userId) {
          try {
            await connectToDatabase();
            
            const submission = new Submission({
              userId,
              problemSlug: slug,
              problemId: problem.id,
              problemTitle: problem.title,
              code,
              language,
              verdict: "Wrong Answer",
              difficulty: problem.difficulty,
              submittedAt: new Date(),
            });
            
            await submission.save();
          } catch (dbError) {
            console.error('Error saving wrong answer to database:', dbError);
          }
        }
        
        return NextResponse.json({
          verdict: "Wrong Answer",
          expected,
          actual,
        });
      }
    }

    // Save submission to database if user is authenticated
    if (userId) {
      try {
        await connectToDatabase();
        
        const submission = new Submission({
          userId,
          problemSlug: slug,
          problemId: problem.id,
          problemTitle: problem.title,
          code,
          language,
          verdict: "Accepted",
          difficulty: problem.difficulty,
          submittedAt: new Date(),
        });
        
        await submission.save();
      } catch (dbError) {
        console.error('Error saving submission to database:', dbError);
        // Continue even if database save fails - submission execution is more important
      }
    }

    return NextResponse.json({ verdict: "Accepted" });
  } catch {
    return NextResponse.json(
      { verdict: "Error", message: "Invalid request" },
      { status: 400 }
    );
  }
}
