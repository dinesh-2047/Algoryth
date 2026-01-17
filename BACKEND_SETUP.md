# Backend Implementation - Database & Auth

## 🎯 Implementation Overview

This implementation provides a complete backend system with:
- ✅ MongoDB database connection
- ✅ User authentication with JWT
- ✅ User profile management
- ✅ Submission tracking system
- ✅ Protected API routes
- ✅ Enhanced AuthContext

## 📁 Files Created/Modified

### New Files Created:

1. **`.env.example`** - Environment variables template
2. **`src/lib/db/models/Submission.js`** - Submission data model
3. **`src/lib/db/models/UserProfile.js`** - User profile data model
4. **`src/app/api/auth/verify/route.js`** - Token verification endpoint
5. **`src/app/api/user/profile/route.js`** - User profile CRUD operations
6. **`src/app/api/submissions/route.js`** - Submissions list and create
7. **`src/app/api/submissions/[id]/route.js`** - Single submission operations

### Modified Files:

1. **`src/context/AuthContext.jsx`** - Enhanced with profile and submission methods

## 🚀 Setup Instructions

### Step 1: Install Dependencies (Already Done ✅)

The required packages are already in `package.json`:
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

### Step 2: Set Up MongoDB

1. **Get MongoDB Connection String:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster (if you don't have one)
   - Click "Connect" → "Connect your application"
   - Copy the connection string

2. **Create Environment File:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` and add your credentials:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algoryth?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

   **Generate a secure JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

### Step 3: Test the Connection

Start your development server:
```bash
npm run dev
```

The MongoDB connection will be established when you first make an API call.

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-17T..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### User Profile

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": { ... },
  "profile": {
    "userId": "...",
    "username": "johndoe",
    "bio": "Competitive programmer",
    "rating": 1500,
    "rank": "Newbie",
    "solvedProblems": {
      "easy": 5,
      "medium": 2,
      "hard": 0,
      "total": 7
    },
    "submissions": {
      "total": 15,
      "accepted": 7,
      "acceptanceRate": 47
    }
  }
}
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "johndoe",
  "bio": "Love solving algorithms!",
  "preferences": {
    "defaultLanguage": "python",
    "theme": "dark"
  },
  "socialLinks": {
    "github": "https://github.com/johndoe"
  }
}
```

### Submissions

#### Get Submissions (with filters)
```http
GET /api/submissions?page=1&limit=20&status=Accepted&language=javascript
Authorization: Bearer <token>
```

**Response:**
```json
{
  "submissions": [
    {
      "problemId": "two-sum",
      "problemTitle": "Two Sum",
      "language": "javascript",
      "status": "Accepted",
      "testCasesPassed": 10,
      "totalTestCases": 10,
      "executionTime": 45,
      "submittedAt": "2026-01-17T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

#### Create Submission
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "problemId": "two-sum",
  "problemTitle": "Two Sum",
  "language": "javascript",
  "code": "function twoSum(nums, target) { ... }",
  "status": "Accepted",
  "testCasesPassed": 10,
  "totalTestCases": 10,
  "executionTime": 45,
  "memoryUsed": 1024,
  "difficulty": "easy"
}
```

#### Get Single Submission
```http
GET /api/submissions/:id
Authorization: Bearer <token>
```

#### Delete Submission
```http
DELETE /api/submissions/:id
Authorization: Bearer <token>
```

## 🔧 Using AuthContext in Components

### Login Example

```jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    
    if (result.success) {
      console.log('Logged in!', result.user);
      // Redirect to dashboard
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Protected Route Example

```jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading, fetchProfile, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user && !profile) {
      fetchProfile();
    }
  }, [user, loading, router, profile, fetchProfile]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome {user.name}!</h1>
      {profile && (
        <div>
          <p>Rating: {profile.rating}</p>
          <p>Rank: {profile.rank}</p>
          <p>Solved: {profile.solvedProblems.total} problems</p>
        </div>
      )}
    </div>
  );
}
```

### Submit Code Example

```jsx
'use client';

import { useAuth } from '@/context/AuthContext';

export default function CodeSubmission({ problemId, problemTitle, difficulty }) {
  const { submitCode, isAuthenticated } = useAuth();

  const handleSubmit = async (code, language, results) => {
    if (!isAuthenticated) {
      alert('Please login to submit');
      return;
    }

    const submission = {
      problemId,
      problemTitle,
      language,
      code,
      status: results.allPassed ? 'Accepted' : 'Wrong Answer',
      testCasesPassed: results.passed,
      totalTestCases: results.total,
      executionTime: results.time,
      memoryUsed: results.memory,
      difficulty,
    };

    const result = await submitCode(submission);
    
    if (result.success) {
      console.log('Submission successful!');
    }
  };

  return (
    <button onClick={() => handleSubmit(code, 'javascript', results)}>
      Submit Solution
    </button>
  );
}
```

## 🔐 Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **JWT Tokens**: Expire after 7 days
3. **Token Verification**: All protected routes verify JWT
4. **Input Validation**: Required fields validated
5. **Ownership Checks**: Users can only access their own data
6. **MongoDB Injection**: Protected by Mongoose

## 📊 Database Models

### User Model
- Basic authentication data
- Email (unique)
- Hashed password
- Timestamps

### UserProfile Model
- Extended user information
- Statistics (rating, solved problems, submissions)
- Preferences (theme, language, font size)
- Social links
- Bookmarked problems

### Submission Model
- Code submission records
- Test results
- Execution metrics
- Links to user and problem

## 🧪 Testing the Implementation

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Test Protected Route
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Next Steps

1. **Integrate with UI**: Update existing auth pages to use new API
2. **Add Submission UI**: Create submission history page
3. **Profile Page**: Build user profile display and edit forms
4. **Statistics Dashboard**: Show user stats and progress
5. **Leaderboard**: Add ranking system
6. **Email Verification**: Add email confirmation (future enhancement)
7. **Password Reset**: Implement forgot password flow

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Check your connection string in `.env.local`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user credentials

**JWT Errors:**
- Ensure JWT_SECRET is set in `.env.local`
- Check token format: `Bearer <token>`

**CORS Issues:**
- Next.js API routes handle CORS automatically
- If deploying separately, add CORS headers

## 📝 Notes

- All API routes use Next.js App Router convention
- Authentication uses HTTP-only approach (token in localStorage)
- For production, consider using HTTP-only cookies for enhanced security
- Rate limiting should be added for production use

---

**Ready to use! 🎉** The backend system is now fully functional and ready for integration with your frontend components.
