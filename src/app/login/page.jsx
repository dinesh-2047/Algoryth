'use client'

import { signIn } from 'next-auth/react'

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <button
          onClick={() => signIn('google')}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
