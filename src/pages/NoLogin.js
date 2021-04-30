import { Button } from "@material-ui/core";
import React from "react";
import firebase from "firebase/app";
import { firebaseApp } from "../lib/firebaseApp";

function NoLogin() {
  return (
    <div className="NoLogin">
      <h1>소프트웨어 입문 TA 채점</h1>
      <h3>로그인해주세요</h3>
      <p>
        <em>혼자 사용하려고 만든 만큼 사용에 불친절할 수 있습니다.</em>
      </p>
      <div>
        <Button
          onClick={() =>
            firebaseApp
              .auth()
              .signInWithPopup(new firebase.auth.GoogleAuthProvider())
          }
          variant="contained"
        >
          로그인
        </Button>
      </div>
    </div>
  );
}

export default NoLogin;
