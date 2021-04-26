import { useContext, useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

import { userStore } from "../stores/userStore";

function GetData() {
  // Auth Use Context
  const { dispatch, state } = useContext(userStore);
  const { currentUser } = state;
  console.log(state);
  useEffect(() => {
    // a
    const unsubAuth = firebaseApp.auth().onAuthStateChanged((user) =>
      dispatch({
        type: "currentUser",
        payload: user,
      })
    );

    // data
    if (!currentUser) {
      console.log("loading");
      dispatch({
        type: "update",
        payload: {
          loading: true,
        },
      });
      return;
    }
    console.log(currentUser);
    return () => {
      unsubAuth();
    };
  }, []);

  return null;
}

export default GetData;
