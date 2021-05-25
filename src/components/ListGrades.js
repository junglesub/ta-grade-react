import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

function ListGrades() {
  const { currentUser } = useContext(userStore).state;
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const datas = await firebaseApp
        .firestore()
        .collection("grades")
        .where("owner", "==", currentUser.uid)
        // .doc("testb")
        .get();
      setGrades(datas.docs.map((data) => data.id));
    })();
  }, [currentUser]);

  return (
    <div>
      <h1>Grade Lists</h1>
      <Link to="/grade/new">Add new</Link>
      <ul>
        {grades.map((gradeId) => (
          <li key={gradeId}>
            <Link to={`/grade/${gradeId}`}>{gradeId}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListGrades;
