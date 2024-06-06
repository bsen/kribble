import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCskmMrzpOrGMi9Bvyi2pCECM17FWRC0tI",
  authDomain: "friendcity-in.firebaseapp.com",
  projectId: "friendcity-in",
  storageBucket: "friendcity-in.appspot.com",
  messagingSenderId: "547226412943",
  appId: "1:547226412943:web:f991e5d26a340c57f48dfa",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithPopup };
