import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyD7ZtyGenV5OZdxGdUxrARSHrNC2u0ixZ4",
  authDomain: "xrep-aff81.firebaseapp.com",
  projectId: "xrep-aff81",
  storageBucket: "xrep-aff81.appspot.com",
  messagingSenderId: "269959176505",
  appId: "1:269959176505:web:a77fc0be7a929a137508e8",
  measurementId: "G-8892KERKH9",
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }

