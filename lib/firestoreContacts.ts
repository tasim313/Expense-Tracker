import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc, deleteDoc} from "firebase/firestore";

// Contacts collection
const contactsRef = collection(db, "contacts");
const categoriesRef = collection(db, "categories");

// ✅ Create Contact (authenticated user)
export async function createContact(
  name: string,
  categoryId: string,
  phone: string,
  email: string,
  address: string,
  priority: string
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const docRef = await addDoc(contactsRef, {
    name,
    categoryId,
    phone,
    email,
    address,
    priority,
    createdBy: user.uid, // track who created this contact
    createdAt: new Date()
  });
  return docRef.id;
}

// ✅ Get all categories (for admin / non-user-specific)
export async function getAllCategories() {
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ✅ Get category by ID
export async function getCategoryById(id: string) {
  const docRef = doc(db, "categories", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

// ✅ Get categories **only for current user**
export const getAllCategoriesForUser = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(
    categoriesRef,
    where("userId", "==", user.uid) // ← use correct field from category collection
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


// ✅ Get all contacts for current user
export const getAllContacts = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(contactsRef, where("createdBy", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ✅ Update contact
export const updateContact = async (id: string, data: Partial<{name:string, categoryId:string, phone:string, email:string, address:string, priority:string}>) => {
  const docRef = doc(db, "contacts", id);
  await updateDoc(docRef, data);
}

// ✅ Delete contact
export const deleteContact = async (id: string) => {
  const docRef = doc(db, "contacts", id);
  await deleteDoc(docRef);
}