import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIcyBpklYK-YYM5BmF_WVdQwfEAOoV-Aw",
  authDomain: "remise-noyon.firebaseapp.com",
  projectId: "remise-noyon",
  storageBucket: "remise-noyon.appspot.com",
  messagingSenderId: "883902593638",
  appId: "1:883902593638:web:a5f90faad94db561cb0ba7",
  measurementId: "G-1TRWG8CFZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
