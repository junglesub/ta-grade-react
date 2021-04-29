import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

import "./StudentView.css";

function StudentView(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors /*, setErrors*/] = useState([]);

  useEffect(() => {
    const firestoreDoc = firebaseApp
      .firestore()
      .collection("grades")
      .doc(prop.match.params.gradeID);

    firestoreDoc
      .get()
      .then((doc) => {
        setGradeInfo(doc.data());
        console.log("Got Data", doc.data());
        firestoreDoc
          .collection("students")
          .get()
          .then((docs) =>
            setStudentInfo(
              docs.docs.reduce(
                (prev, curr) => ({
                  ...prev,
                  [curr.id]: curr.data(),
                }),
                {}
              )
            )
          )
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
        setGradeInfo(null);
      });
  }, [prop.match.params.gradeID]);
  document.title = `${prop.match.params.gradeID} 기록`;

  return gradeInfo === null || !gradeInfo === {} ? (
    <h1>Error</h1>
  ) : (
    <div className="StudentView">
      <div>
        {errors.map((error) => (
          <Alert key={error} severity="error">
            {error}
          </Alert>
        ))}
      </div>
      <div>
        <h1>{gradeInfo.gradeName}</h1>
      </div>
      <div>
        {studentInfo &&
          Object.values(studentInfo).map((student, index) => (
            <div key={student.hakbun} className="onestu">
              <h3>{student.hakbun}</h3>
              <h4>
                총점:{" "}
                {Object.values(student.points).reduce((prev, curr) => {
                  return +Number.parseFloat(prev + +(curr.point || 0)).toFixed(
                    2
                  );
                }, 0)}
              </h4>
              {Object.values(student.points)
                .filter((point) => point.deduct > 0)
                .map((point) => (
                  <div key={point.uuid}>
                    (-{point.deduct}) {point.desc}
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default StudentView;
