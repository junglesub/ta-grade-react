import React from "react";
import { firebaseApp } from "../lib/firebaseApp";
import { Button } from "@material-ui/core";

function Home() {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          firebaseApp.auth().signOut();
        }}
      >
        Logout
      </Button>
    </div>
  );
}

export default Home;
