import { connectToDatabase } from '../../../../lib/db/connect.js';
import User from '../../../../lib/db/models/User.js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function buildUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    rating: user.rating || 1200,
    streakCount: user.streakCount || 0,
    longestStreak: user.longestStreak || 0,
    contestsPlayed: user.contestsPlayed || 0,
    contestRatingHistory: user.contestRatingHistory || [],
    createdAt: user.createdAt,
  };
}

function signUserToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
}

function getEnvAdminCredentials() {
  const adminEmail = String(
    process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || ''
  )
    .split(',')[0]
    .trim()
    .toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

  return {
    adminEmail,
    adminPassword,
  };
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validate input
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { adminEmail, adminPassword } = getEnvAdminCredentials();
    const isEnvAdminLogin =
      Boolean(adminEmail) &&
      Boolean(adminPassword) &&
      normalizedEmail === adminEmail &&
      password === adminPassword;

    if (isEnvAdminLogin) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            role: 'admin',
            password: hashedAdminPassword,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            name: 'Admin',
            email: normalizedEmail,
            rating: 1200,
            streakCount: 0,
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      const token = signUserToken(adminUser);
      return NextResponse.json(
        {
          message: 'Admin login successful',
          user: buildUserResponse(adminUser),
          token,
        },
        { status: 200 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signUserToken(user);
    const userResponse = buildUserResponse(user);

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: userResponse,
        token: token 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}