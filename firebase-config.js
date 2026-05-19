import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfRMldBEKA60sx6gTnJJTV5qo5TG8megk",
  authDomain: "rivenflawstore.firebaseapp.com",
  projectId: "rivenflawstore",
  storageBucket: "rivenflawstore.firebasestorage.app",
  messagingSenderId: "251566538187",
  appId: "1:251566538187:web:ad54915d6f4a87e152ca4e"
};

// Conexión real
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);