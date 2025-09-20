import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAYE3z8umacieuhUF_X_nCAJGHOCAUZ998",
  authDomain: "expance-tracker-2af20.firebaseapp.com",
  projectId: "expance-tracker-2af20",
  storageBucket: "expance-tracker-2af20.firebasestorage.app",
  messagingSenderId: "852772758296",
  appId: "1:852772758296:web:184aa9a7d918fc3b86346d",
  measurementId: "G-93WBQ20NWV",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Initialize Analytics (only in browser)
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export { analytics }
export default app
