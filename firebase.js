// 🔥 Firebase CDN Imports (Browser Version)

import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 YOUR CONFIG (Already Correct)
const firebaseConfig = {
  apiKey: "AIzaSyBLoKDJBx2duS4Be9AZ30SP28UDcpB8TxU",
  authDomain: "lists-maker.firebaseapp.com",
  projectId: "lists-maker",
  storageBucket: "lists-maker.firebasestorage.app",
  messagingSenderId: "815131393205",
  appId: "1:815131393205:web:3cd55df04a51e31bb312fc",
  measurementId: "G-1JC93JRZ62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make Firestore functions global (so script.js can use them)
window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.updateDoc = updateDoc;

console.log("🔥 Firebase Connected Successfully!");
