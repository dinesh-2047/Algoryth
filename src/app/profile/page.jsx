'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(setUserData)
    }
  }, [session])

  if (!session) return <div>Please log in</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div className="grid gap-4">
        <div>Rating: {userData?.rating || 0}</div>
        <div>Submissions: {userData?.submissions?.length || 0}</div>
        <div>Progress: {userData?.submissions?.length || 0} problems attempted</div>
      </div>
    </div>
  )
}
