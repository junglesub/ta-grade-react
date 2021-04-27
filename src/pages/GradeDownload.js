import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { firebaseApp } from "../lib/firebaseApp";

import "./Grade.css";

function GradeDownload(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  // const [errors /*, setErrors*/] = useState([]);
  const [headerGrade, setHeaderGrade] = useState({});
  const [printGrade, setPrintGrade] = useState([]);

  useEffect(() => {
    if (!gradeInfo || Object.keys(gradeInfo).length === 0) return;
    const headerGrade = gradeInfo.points.map((point) => ({
      name: point.name,
      pointId: point.pointId,
    }));
    setHeaderGrade(headerGrade);
    if (headerGrade.length === 1) return;

    const printGrade = [];
    Object.values(studentInfo).map((student) => {
      if (student.points) {
        const stuGrd = [student.hakbun];
        headerGrade.map((gpoint) => {
          stuGrd.push(
            typeof student.points[gpoint.pointId] === "object"
              ? student.points[gpoint.pointId].point
              : ""
          );
          return null;
        });
        stuGrd.push(
          Number.parseFloat(
            stuGrd.slice(1).reduce((prev, curr) => prev + +curr, 0)
          ).toFixed(2)
        );
        printGrade.push(stuGrd);
      }
      return null;
    });
    console.log(printGrade);
    setPrintGrade(printGrade);
  }, [gradeInfo, studentInfo]);

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
  document.title = `${prop.match.params.gradeID} 다운로드`;

  return gradeInfo === null || !gradeInfo === {} ? (
    <h1>Error</h1>
  ) : (
    <div className="GradeDownload">
      <CSVLink
        data={[
          [
            "hakbun",
            ...Object.values(headerGrade).map((header) => header.name),
            "total",
          ],
          ...printGrade,
        ]}
      >
        Download
      </CSVLink>
    </div>
  );
}

export default GradeDownload;
