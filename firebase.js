import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr17OcxaYDdAh-NgagZkEjkmeTKG45pwU",
  authDomain: "flashcards-saas-71103.firebaseapp.com",
  projectId: "flashcards-saas-71103",
  storageBucket: "flashcards-saas-71103.appspot.com",
  messagingSenderId: "755526532700",
  appId: "1:755526532700:web:0a59aaa2cc89a5542d3099",
  measurementId: "G-P4CJ34FQYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics only if supported and in the client-side environment
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, analytics };