import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBJFAV4-QMggAW2K1YtpsXIZ5PQ8KJzo9k",
  authDomain: "crafiq-a.firebaseapp.com",
  projectId: "crafiq-a",
  storageBucket: "crafiq-a.firebasestorage.app",
  messagingSenderId: "176082460783",
  appId: "1:176082460783:web:cd0b594cc803932eaa2d9a",
  measurementId: "G-QB84Z9EMZW",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
