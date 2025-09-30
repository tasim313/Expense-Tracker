"use client"

import { useState, useEffect } from "react"
import { createContact, getAllCategories } from "@/lib/firestoreContacts"
import { Button } from "@/components/ui/button"

export default function CreateContact() {
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([])
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [priority, setPriority] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const data = await getAllCategories()
    setCategories(data)
  }

  const handleSubmit = async () => {
    if (!name || !categoryId) return alert("Name and category are required")
    await createContact(name, categoryId, phone, email, address, priority)
    alert("Contact created successfully")
    setName("")
    setCategoryId("")
    setPhone("")
    setEmail("")
    setAddress("")
    setPriority("")
  }

  return (
    <div className="p-4 space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Create Contact</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <input
        placeholder="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <Button onClick={handleSubmit} className="w-full">
        Create Contact
      </Button>
    </div>
  )
}
