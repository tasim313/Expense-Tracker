import { db, auth } from "@/lib/firebase"
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore"

const categoriesRef = collection(db, "categories")

// ✅ Create Category/Subcategory
export async function createCategory(name: string, icon: string, parentId: string | null = null) {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  const docRef = await addDoc(categoriesRef, {
    name,
    icon,
    parentId,             // null for top-level
    userId: user.uid,     // important!
    createdAt: new Date(),
  })
  return docRef.id
}

// ✅ Get categories for current user
export async function getChildren(parentId: string | null = null) {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  const q = query(
    categoriesRef,
    where("parentId", "==", parentId),
    where("userId", "==", user.uid) // ← only fetch current user’s categories
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// ✅ Update category (only current user can update)
export async function updateCategory(id: string, data: Partial<{ name: string; icon: string }>) {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  const docRef = doc(db, "categories", id)
  await updateDoc(docRef, data)
}

// ✅ Delete category (only current user can delete)
export async function deleteCategory(id: string) {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  const docRef = doc(db, "categories", id)
  await deleteDoc(docRef)
}