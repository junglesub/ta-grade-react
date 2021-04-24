import { Button } from "@material-ui/core";
import "./App.css";
import firebase from "firebase/app";
import { firebaseApp } from "./lib/firebaseApp";

function App() {
  return (
    <div className="App">
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

export default App;
