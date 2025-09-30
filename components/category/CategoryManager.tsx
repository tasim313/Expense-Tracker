"use client"

import { useEffect, useState } from "react"
import { createCategory, getChildren, updateCategory, deleteCategory } from "@/lib/firestoreCategories"
import { Button } from "@/components/ui/button"
import { Target, Pencil, Trash2, Eye, EyeOff, Save } from "lucide-react"


interface Category {
  id: string
  name: string
  icon: string
  parentId: string | null
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")

  // Load top-level categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const data = await getChildren(null) as Category[]
    setCategories(data)
    setLoading(false)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName) return
    await createCategory(newCategoryName, newCategoryIcon || "📂", null)
    setNewCategoryName("")
    setNewCategoryIcon("")
    fetchCategories()
  }

  return (
    <div className="p-4 space-y-6">
        <h2 className="text-xl font-bold">Category Manager</h2>

        {/* Add Category */}
        <div className="flex gap-2">
        <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="border p-2 rounded w-1/3"
        />
        <input
            type="text"
            placeholder="Icon (emoji)"
            value={newCategoryIcon}
            onChange={(e) => setNewCategoryIcon(e.target.value)}
            className="border p-2 rounded w-1/4"
        />
        <Button
            onClick={handleAddCategory}
            size="sm"
            className="min-w-[80px] flex-shrink-0"
        >
        <Target className="mr-2 h-4 w-4" />
            Add
        </Button>
        </div>

        {/* Category Tree */}
        {loading ? (
        <p>Loading...</p>
        ) : (
        <div className="space-y-2">
            {categories.map((cat) => (
            <CategoryNode key={cat.id} category={cat} />
            ))}
        </div>
        )}
    </div>
  )
}

function CategoryNode({ category }: { category: Category }) {
  const [children, setChildren] = useState<Category[]>([])
  const [showChildren, setShowChildren] = useState(false)
  const [newSubName, setNewSubName] = useState("")
  const [newSubIcon, setNewSubIcon] = useState("")
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editIcon, setEditIcon] = useState(category.icon)

  const fetchChildren = async () => {
    const subs = await getChildren(category.id) as Category[]
    setChildren(subs)
  }

  const handleToggle = async () => {
    if (!showChildren) {
      await fetchChildren()
    }
    setShowChildren(!showChildren)
  }

  const handleAddSub = async () => {
    if (!newSubName) return
    await createCategory(newSubName, newSubIcon || "📂", category.id)
    setNewSubName("")
    setNewSubIcon("")
    fetchChildren()
    setShowChildren(true)
  }

  const handleUpdate = async () => {
    await updateCategory(category.id, { name: editName, icon: editIcon })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("Delete this category?")) {
      await deleteCategory(category.id)
      window.location.reload() // simple refresh for demo
    }
  }

  return (
        <div className="ml-4 border-l pl-4">
        <div className="flex items-center gap-2">
            {editing ? (
            <>
                <input
                className="border p-1 rounded"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                />
                <input
                className="border p-1 rounded w-16"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                />
                <Button onClick={handleUpdate} size="sm" className="bg-green-600">
                <Save className="mr-2 h-4 w-4" />
                Save
                </Button>
            </>
            ) : (
            <>
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <Button
                onClick={() => setEditing(true)}
                size="sm"
                variant="outline"
                >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
                </Button>
                <Button
                onClick={handleDelete}
                size="sm"
                variant="destructive"
                >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
                </Button>
                <Button
                onClick={handleToggle}
                size="sm"
                variant="secondary"
                >
                {showChildren ? (
                    <>
                    <EyeOff className="mr-1 h-4 w-4" />
                    Hide
                    </>
                ) : (
                    <>
                    <Eye className="mr-1 h-4 w-4" />
                    Show
                    </>
                )}
                </Button>
            </>
            )}
        </div>
    
        {/* Add Subcategory */}
        {showChildren && (
            <div className="ml-6 mt-2 space-y-2">
            {children.map((child) => (
                <CategoryNode key={child.id} category={child} />
            ))}
            <div className="flex gap-2">
                <input
                type="text"
                placeholder="Subcategory name"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="border p-1 rounded"
                />
                <input
                type="text"
                placeholder="Icon"
                value={newSubIcon}
                onChange={(e) => setNewSubIcon(e.target.value)}
                className="border p-1 rounded w-16"
                />
                <Button onClick={handleAddSub} size="sm" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Add
                </Button>
            </div>
            </div>
        )}
        </div>
  )
}