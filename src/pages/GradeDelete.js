import { Button } from "@material-ui/core";
import React, { useContext, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

function GradeDelete(prop) {
  const { currentUser } = useContext(userStore).state;
  const [deleted, setDeleted] = useState("");
  return (
    <div>
      <p>삭제가 되면 복구가 안됩니다.</p>
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
