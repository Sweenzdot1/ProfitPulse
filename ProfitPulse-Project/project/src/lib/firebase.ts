import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDrxHeubMuh2dF2Mw4UEptpVfTHxk8eTYc",
  authDomain: "finance-tracker-ec130.firebaseapp.com",
  projectId: "finance-tracker-ec130",
  storageBucket: "finance-tracker-ec130.firebasestorage.app",
  messagingSenderId: "316759157232",
  appId: "1:316759157232:web:ab4e597486a4ed09ce5535",
  measurementId: "G-8548K3CNWC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);