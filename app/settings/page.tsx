"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!user) return
    setLoading(true)
    try {
      await user.updateProfile({ displayName })
      alert("Profile updated successfully!")
    } catch (err) {
      console.error(err)
      alert("Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <div>
        <label>Name:</label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? "Updating..." : "Update Name"}
      </Button>
      {/* Add password update here if using Firebase Auth */}
    </div>
  )
}
