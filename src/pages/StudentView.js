import { Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";
import { gradeReasonCombine } from "../lib/gradeReasonCombine";

import "./StudentView.css";

function StudentView(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors, setErrors] = useState([]);

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

  const copyToClipboard = (event) => {
    const deduct =
      event.target.parentElement.parentElement.getElementsByClassName(
        "deduct"
      )[0].innerText;

    navigator.clipboard.writeText(deduct).catch((e) => {
      console.error(e);
      setErrors((state) => [...state, "Error: " + e.toString()]);
    });
  };

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
          Object.values(studentInfo).map((student, index) => {
            const studentCpy = gradeReasonCombine(student);
            return (
              <div key={studentCpy.hakbun} className="onestu">
                <h3>{studentCpy.hakbun}</h3>
                <Button onClick={copyToClipboard}>클립보드 복사</Button>
                <h4>
                  총점:{" "}
                  {
                    +Number.parseFloat(
                      Object.values(studentCpy.points).reduce((prev, curr) => {
                        return prev + +(curr.point || 0);
                      }, 0) * (studentCpy.late ? 1 - gradeInfo.late_deduct : 1)
                    ).toFixed(2)
                  }
                  {/* {Object.values(studentCpy.points).reduce((prev, curr) => {
                  return +Number.parseFloat(prev + +(curr.point || 0)).toFixed(
                    2
                  );
                }, 0)} */}
                </h4>
                <div className="deduct">
                  {Object.keys(studentCpy.points)
                    .filter(
                      (pointId) =>
                        studentCpy.points[pointId].deduct > 0 ||
                        studentCpy.points[pointId].multi
                    )
                    .sort((a, b) => +a.split("-")[1] - +b.split("-")[1])
                    .map((pointId) => (
                      <div key={pointId}>
                        {studentCpy.points[pointId].multi ? (
                          studentCpy.points[pointId].multi
                            .filter((m) => m.deduct !== 0)
                            .map((m) => (
                              <div key={`(-${m.deduct}) ${m.reason}`}>
                                (-{m.deduct}) {m.reason}
                              </div>
                            ))
                        ) : (
                          <div>
                            (-{studentCpy.points[pointId].deduct}){" "}
                            {studentCpy.points[pointId].desc}
                          </div>
                        )}
                      </div>
                    ))}
                  {studentCpy.late && (
                    <div>Late: {(gradeInfo.late_deduct || 0) * 100}% 감점</div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default StudentView;
