import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore"

// Contacts collection
const contactsRef = collection(db, "contacts")
const categoriesRef = collection(db, "categories")

// ✅ Create Contact (non-authenticated user)
export async function createContact(
  name: string,
  categoryId: string,
  phone: string,
  email: string,
  address: string,
  priority: string
) {
  const docRef = await addDoc(contactsRef, {
    name,
    categoryId,
    phone,
    email,
    address,
    priority,
    createdAt: new Date()
  })
  return docRef.id
}

// ✅ Get Categories
export async function getAllCategories() {
  const snapshot = await getDocs(categoriesRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ✅ Get category by ID
export async function getCategoryById(id: string) {
  const docRef = doc(db, "categories", id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}
