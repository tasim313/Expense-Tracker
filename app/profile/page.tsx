"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) return <div className="p-4">You are not logged in.</div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <p><strong>Name:</strong> {user.displayName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <Button className="mt-4" onClick={() => router.push("/settings")}>
        Go to Settings
      </Button>
    </div>
  )
}
