import React from "react";
import firebase from "firebase/app";
import { firebaseApp } from "../lib/firebaseApp";
import { Button } from "@material-ui/core";

function Home() {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          firebaseApp
            .auth()
            .signInWithPopup(new firebase.auth.GoogleAuthProvider());
        }}
      >
        Login
      </Button>
    </div>
  );
}

export default Home;
