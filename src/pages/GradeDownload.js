import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { CSVLink } from "react-csv";
import { firebaseApp } from "../lib/firebaseApp";

import "./Grade.css";

function multiDeductReasonJoin(deducts) {
  return (
    " " + deducts.map((item) => `(-${item.deduct}) ${item.reason}`).join(", ")
  );
}

function GradeDownload(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  // const [errors /*, setErrors*/] = useState([]);
  const [headerGrade, setHeaderGrade] = useState({});
  const [printGrade, setPrintGrade] = useState([]);
  const [giveReason, setGiveReason] = useState(false);

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
          const pointItem = student.points[gpoint.pointId];
          console.log({ pointItem });
          stuGrd.push(
            typeof pointItem === "object"
              ? `${pointItem.point}${
                  giveReason && pointItem.uuid !== 0
                    ? !!pointItem.multi
                      ? multiDeductReasonJoin(pointItem.multi)
                      : ` (${pointItem.desc})`
                    : ""
                }`
              : ""
          );
          return null;
        });
        stuGrd.push(
          student.late ? `(${(gradeInfo.late_deduct || 0) * 100}%)` : ""
        );
        // 총점
        stuGrd.push(
          Number.parseFloat(
            Object.values(student.points).reduce((prev, curr) => {
              return prev + +(curr.point || 0);
            }, 0) * (student.late ? 1 - gradeInfo.late_deduct : 1)
          ).toFixed(2)
        );
        printGrade.push(stuGrd);
      }
      return null;
    });
    console.log(printGrade);
    setPrintGrade(printGrade);
  }, [gradeInfo, studentInfo, giveReason]);

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
      <FormControlLabel
        control={
          <Checkbox
            checked={giveReason}
            onChange={(e) => setGiveReason(e.target.checked)}
          />
        }
        label="감점사유 포함"
      />
      <br />
      <CSVLink
        filename={`${prop.match.params.gradeID}.csv`}
        data={[
          [
            "hakbun",
            ...Object.values(headerGrade).map((header) => header.name),
            "late",
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
