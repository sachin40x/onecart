import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "onecart-f97d3.firebaseapp.com",
  projectId: "onecart-f97d3",
  storageBucket: "onecart-f97d3.firebasestorage.app",
  messagingSenderId: "682596324910",
  appId: "1:682596324910:web:c4645390c802d5c67f71bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


export {auth , provider}

