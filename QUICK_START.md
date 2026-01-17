# 🚀 Quick Start Guide - Backend Implementation

## Get Running in 5 Minutes!

### Step 1: MongoDB Setup (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create a **FREE** cluster
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string (looks like: `mongodb+srv://...`)

### Step 2: Environment Variables (30 seconds)

```bash
# Copy the template
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/algoryth?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this
```

💡 **Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### Step 3: Start Server (10 seconds)

```bash
npm run dev
```

### Step 4: Test It! (2 minutes)

Open a new terminal and run:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

✅ **Success!** You should see JSON responses with user data and a token.

---

## What You Can Do Now

### 1. Use Authentication in Your Components

```jsx
'use client';
import { useAuth } from '@/context/AuthContext';

export default function MyPage() {
  const { user, login, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return <div>Welcome {user.name}!</div>;
}
```

### 2. Protect Routes

```jsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content!</div>;
}
```

### 3. Submit Code Solutions

```jsx
const { submitCode } = useAuth();

const handleSubmit = async () => {
  const result = await submitCode({
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    language: 'javascript',
    code: userCode,
    status: 'Accepted',
    testCasesPassed: 10,
    totalTestCases: 10,
    executionTime: 42,
    memoryUsed: 1024,
    difficulty: 'easy'
  });

  if (result.success) {
    alert('Submission recorded!');
  }
};
```

---

## API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get token |
| `/api/auth/verify` | GET | Verify token |
| `/api/user/profile` | GET | Get user profile |
| `/api/user/profile` | PUT | Update profile |
| `/api/submissions` | GET | List submissions |
| `/api/submissions` | POST | Create submission |
| `/api/submissions/:id` | GET | Get submission |
| `/api/submissions/:id` | DELETE | Delete submission |
| `/api/leaderboard` | GET | Global leaderboard |
| `/api/users/:username` | GET | Public profile |

---

## Troubleshooting

### "Could not connect to MongoDB"

❌ **Problem**: Connection string incorrect or IP not whitelisted

✅ **Solution**: 
1. Check your `.env.local` file
2. In MongoDB Atlas, go to **Network Access**
3. Click **"Add IP Address"** → **"Allow Access from Anywhere"** (for development)

### "JWT_SECRET not defined"

❌ **Problem**: Environment variable not set

✅ **Solution**: Add `JWT_SECRET=your_secret_key` to `.env.local`

### "User already exists"

❌ **Problem**: Email already registered

✅ **Solution**: Use a different email or login with existing account

### Authentication not working in components

❌ **Problem**: Token not being sent

✅ **Solution**: Make sure you're wrapping your app with `<AuthProvider>` in `layout.jsx`

```jsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Next Steps

1. ✅ **Test all endpoints** - See `TESTING_GUIDE.md`
2. ✅ **Read the docs** - See `BACKEND_SETUP.md`
3. ✅ **View examples** - See `USAGE_EXAMPLES.jsx`
4. ✅ **Integrate with UI** - Update your components
5. ✅ **Deploy** - Push to production

---

## Need More Help?

📖 **Full Documentation**: `BACKEND_SETUP.md`  
🧪 **Testing Guide**: `TESTING_GUIDE.md`  
💡 **Code Examples**: `USAGE_EXAMPLES.jsx`  
📝 **Summary**: `IMPLEMENTATION_COMPLETE.md`

---

**That's it! You're ready to build amazing features! 🎉**
