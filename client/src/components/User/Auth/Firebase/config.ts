import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHyvMbkwd43d0o2bQ1swPjqIrzFI-4K5o",
  authDomain: "kribble-net.firebaseapp.com",
  projectId: "kribble-net",
  storageBucket: "kribble-net.appspot.com",
  messagingSenderId: "871548288920",
  appId: "1:871548288920:web:438b3c012e272cd14df5ed",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithPopup };
