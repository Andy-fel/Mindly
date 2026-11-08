// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Añade esto



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1BLe2et4RwNwNt1d7SXAPVJ782A2wzmc",
  authDomain: "mindly-56c18.firebaseapp.com",
  projectId: "mindly-56c18",
  storageBucket: "mindly-56c18.firebasestorage.app",
  messagingSenderId: "678183501317",
  appId: "1:678183501317:web:65a6e063a6a7244295666c",
  measurementId: "G-FKTJZLM52V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- Exporta la base de datos
export const googleProvider = new GoogleAuthProvider();