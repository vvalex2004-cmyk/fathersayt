import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD50Lw1SMn1Xx61kpMf6gGc845Q8_rFntk",
  authDomain: "fathersayt.firebaseapp.com",
  projectId: "fathersayt",
  storageBucket: "fathersayt.firebasestorage.app",
  messagingSenderId: "956025236630",
  appId: "1:956025236630:web:29c1f510ec679a3b95a6b7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);