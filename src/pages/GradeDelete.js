import { Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useContext, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

function GradeDelete(prop) {
  const { currentUser } = useContext(userStore).state;
  const [deleted, setDeleted] = useState("");

  document.title = `${prop.match.params.gradeID} 영구삭제`;

  return (
    <div>
      <Alert severity="warning">삭제를 할 경우 복구가 안됩니다.</Alert>
      <Button
        variant="contained"
        disabled={!currentUser}
        onClick={() => {
          firebaseApp
            .firestore()
            .collection("grades")
            .doc(prop.match.params.gradeID)
            .delete()
            .then(() => setDeleted("Deleted"))
            .catch((e) => setDeleted(e.toString()));
        }}
      >
        영구삭제
      </Button>
      {deleted && <p>{deleted}</p>}
    </div>
  );
}

export default GradeDelete;
