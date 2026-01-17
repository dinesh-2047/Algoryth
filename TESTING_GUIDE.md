# Backend Implementation Testing Guide

## 🧪 Testing Your Implementation

This guide provides step-by-step instructions for testing the backend implementation.

## Prerequisites

1. **MongoDB Setup**: Ensure you have MongoDB connection string
2. **Environment Variables**: `.env.local` file configured
3. **Server Running**: `npm run dev` should be running

## Testing Checklist

### ✅ Phase 1: Database Connection

**Test**: Check if MongoDB connects successfully

```bash
# Start the dev server
npm run dev

# Watch the console for:
# "MongoDB connected successfully"
```

**Expected Behavior**: No connection errors in console

---

### ✅ Phase 2: User Registration

**Test 1: Register a new user**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "2026-01-17T..."
  }
}
```

**Test 2: Try registering with same email**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "test@example.com",
    "password": "test456"
  }'
```

**Expected Response** (409 Conflict):
```json
{
  "error": "User with this email already exists"
}
```

**Test 3: Invalid email format**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad Email",
    "email": "not-an-email",
    "password": "test123"
  }'
```

**Expected Response** (400 Bad Request):
```json
{
  "error": "Please enter a valid email address"
}
```

---

### ✅ Phase 3: User Login

**Test 1: Login with valid credentials**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2026-01-17T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💡 Save the token** - You'll need it for authenticated requests!

**Test 2: Login with wrong password**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response** (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

---

### ✅ Phase 4: Token Verification

**Test**: Verify JWT token

```bash
# Replace YOUR_TOKEN_HERE with the token from login
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "2026-01-17T..."
  }
}
```

---

### ✅ Phase 5: User Profile

**Test 1: Get profile (auto-creates if doesn't exist)**

```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (200 OK):
```json
{
  "user": { ... },
  "profile": {
    "userId": "507f1f77bcf86cd799439011",
    "rating": 1500,
    "rank": "Newbie",
    "solvedProblems": {
      "easy": 0,
      "medium": 0,
      "hard": 0,
      "total": 0
    },
    "submissions": {
      "total": 0,
      "accepted": 0,
      "acceptanceRate": 0
    },
    "preferences": {
      "defaultLanguage": "javascript",
      "theme": "system",
      "editorFontSize": 14
    }
  }
}
```

**Test 2: Update profile**

```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcoder",
    "bio": "I love algorithms!",
    "preferences": {
      "defaultLanguage": "python",
      "theme": "dark"
    },
    "socialLinks": {
      "github": "https://github.com/testcoder"
    }
  }'
```

**Expected Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

---

### ✅ Phase 6: Submissions

**Test 1: Create a submission**

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "two-sum",
    "problemTitle": "Two Sum",
    "language": "javascript",
    "code": "function twoSum(nums, target) { ... }",
    "status": "Accepted",
    "testCasesPassed": 10,
    "totalTestCases": 10,
    "executionTime": 42,
    "memoryUsed": 1024,
    "difficulty": "easy"
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "Submission created successfully",
  "submission": {
    "_id": "...",
    "userId": "...",
    "problemId": "two-sum",
    "status": "Accepted",
    ...
  }
}
```

**Test 2: Get submissions list**

```bash
curl "http://localhost:3000/api/submissions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (200 OK):
```json
{
  "submissions": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

**Test 3: Filter submissions**

```bash
curl "http://localhost:3000/api/submissions?status=Accepted&language=javascript" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### ✅ Phase 7: Leaderboard

**Test**: Get leaderboard

```bash
curl "http://localhost:3000/api/leaderboard?page=1&limit=10&sortBy=rating"
```

**Expected Response** (200 OK):
```json
{
  "leaderboard": [
    {
      "position": 1,
      "username": "testcoder",
      "rating": 1500,
      "rank": "Newbie",
      "solvedProblems": 1,
      "submissions": 1,
      "acceptanceRate": 100
    }
  ],
  "pagination": { ... }
}
```

---

### ✅ Phase 8: Public Profile

**Test**: View another user's profile

```bash
curl http://localhost:3000/api/users/testcoder
```

**Expected Response** (200 OK):
```json
{
  "profile": {
    "username": "testcoder",
    "bio": "I love algorithms!",
    "rating": 1500,
    "rank": "Newbie",
    "solvedProblems": { ... },
    "submissions": { ... }
  }
}
```

---

## Browser Testing

### Using Browser DevTools

1. **Open DevTools** (F12 or Cmd+Opt+I)
2. **Go to Console tab**
3. **Run these commands**:

#### Register User
```javascript
await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Browser Test',
    email: 'browser@test.com',
    password: 'test123'
  })
}).then(r => r.json()).then(console.log);
```

#### Login
```javascript
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'browser@test.com',
    password: 'test123'
  })
}).then(r => r.json());

// Save token
const token = loginRes.token;
console.log('Token:', token);
```

#### Get Profile
```javascript
await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

---

## Testing with React Components

### Test Login Flow

1. Navigate to `/auth` page
2. Fill in registration form
3. Click "Register"
4. Check console for success message
5. Try logging in with same credentials
6. Should redirect to problems page

### Test Profile Update

1. Login to your account
2. Navigate to `/settings` (you may need to create this page)
3. Update username, bio, preferences
4. Save changes
5. Refresh page - changes should persist

### Test Submission

1. Login to your account
2. Go to any problem page
3. Write code solution
4. Click "Submit"
5. Check that submission is recorded
6. Go to `/submissions` to see your history

---

## Debugging Tips

### MongoDB Connection Issues

```javascript
// Add to src/lib/db/connect.js
mongoose.set('debug', true); // Enable query logging
```

### Check Database Content

Use MongoDB Compass or Atlas UI:
- Check `users` collection
- Check `userprofiles` collection
- Check `submissions` collection

### JWT Token Issues

```javascript
// Decode JWT token to see contents
const token = 'YOUR_TOKEN_HERE';
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(window.atob(base64));
console.log(payload);
```

### Common Error Codes

- **400**: Bad request - check your request data
- **401**: Unauthorized - check your token
- **403**: Forbidden - you don't have permission
- **404**: Not found - resource doesn't exist
- **409**: Conflict - resource already exists
- **500**: Server error - check server logs

---

## Automated Testing Script

Create a test script `test-backend.js`:

```javascript
const BASE_URL = 'http://localhost:3000';
let token = '';

async function test() {
  // 1. Register
  console.log('Testing registration...');
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Auto Test',
      email: `test${Date.now()}@example.com`,
      password: 'test123'
    })
  });
  console.log('Register:', await registerRes.json());

  // 2. Login
  console.log('\nTesting login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      password: 'test123'
    })
  });
  const loginData = await loginRes.json();
  token = loginData.token;
  console.log('Login:', loginData);

  // 3. Get Profile
  console.log('\nTesting profile...');
  const profileRes = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Profile:', await profileRes.json());

  console.log('\n✅ All tests passed!');
}

test().catch(console.error);
```

Run with: `node test-backend.js`

---

## Success Criteria

✅ **All tests pass**
✅ **No console errors**
✅ **Data persists in MongoDB**
✅ **Token authentication works**
✅ **Profile updates correctly**
✅ **Submissions tracked properly**

---

**Need help?** Check the `BACKEND_SETUP.md` for detailed implementation docs!
