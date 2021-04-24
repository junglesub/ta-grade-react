import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkDPD-cUNDM3rsyLxDCdAQkITCQqvlQL4",
  authDomain: "ta-grade-2021.firebaseapp.com",
  projectId: "ta-grade-2021",
  storageBucket: "ta-grade-2021.appspot.com",
  messagingSenderId: "905277461000",
  appId: "1:905277461000:web:3c2cb9d7c92ed9a60bb7bd",
};

export const firebaseApp =
  firebase.apps.length != 0
    ? firebase.app()
    : firebase.initializeApp(firebaseConfig);
