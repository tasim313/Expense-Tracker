import { db } from "@/lib/firebase"
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore"

const categoriesRef = collection(db, "categories")

// ✅ Create Category or any-level Subcategory
export async function createCategory(name: string, icon: string, parentId: string | null = null) {
  const docRef = await addDoc(categoriesRef, {
    name,
    icon,
    parentId, // null for top-level, or parent category id
    createdAt: new Date(),
  })
  return docRef.id
}

// ✅ Get children of any category (works for sub/sub-sub)
export async function getChildren(parentId: string | null = null) {
  const q = query(categoriesRef, where("parentId", "==", parentId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// ✅ Update Category
export async function updateCategory(id: string, data: Partial<{ name: string; icon: string }>) {
  const docRef = doc(db, "categories", id)
  await updateDoc(docRef, data)
}

// ✅ Delete Category
export async function deleteCategory(id: string) {
  const docRef = doc(db, "categories", id)
  await deleteDoc(docRef)
}
