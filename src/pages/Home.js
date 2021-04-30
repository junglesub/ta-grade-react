import React from "react";
import { firebaseApp } from "../lib/firebaseApp";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

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
      <div>
        <Link to="/grade">/grade</Link>
      </div>
    </div>
  );
}

export default Home;
