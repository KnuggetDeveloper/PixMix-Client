// firebase.config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Web SDK

const firebaseConfig = {
  apiKey: "AIzaSyBp_JPcbkcyX38Cyo-XK2dNcsX-AJ7jLSI",
  authDomain: "pixmix-6a12e.firebaseapp.com",
  projectId: "pixmix-6a12e",
  storageBucket: "pixmix-6a12e.appspot.com",
  messagingSenderId: "493914627855",
  appId: "1:493914627855:android:be09720daf7ca91c26687a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
