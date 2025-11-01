// client/src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdPA1G3TqrQvpiKJNVtZE-q_0r-yud3vc",
  authDomain: "existential-companion.firebaseapp.com",
  databaseURL:
    "https://existential-companion-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "existential-companion",
  storageBucket: "existential-companion.firebasestorage.app",
  messagingSenderId: "576722742197",
  appId: "1:576722742197:web:ff9ec4c648d845e94287fc",
  measurementId: "G-34WVYLBJQJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export all functions needed by App.js
export { database, ref, set, get, remove, query, orderByChild, limitToLast };
