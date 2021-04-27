import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

import "./Grade.css";

const StyledTableRow = withStyles((theme) => ({
  root: {
    "& .cl-0": {
      backgroundColor: theme.palette.action.hover,
    },
    // "&:nth-of-type(odd)": {
    //   backgroundColor: theme.palette.action.hover,
    // },
  },
}))(TableRow);

function GradeView(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors /*, setErrors*/] = useState([]);
  const [deducter, setDeducter] = useState({});

  useEffect(() => {
    const newDeducter = {};
    Object.values(studentInfo).map((student) => {
      Object.keys(student.points).map((point) => {
        const key = `${point}-${student.points[point].uuid}`;
        const list = newDeducter[key] || [];
        list.push(student.hakbun);
        newDeducter[key] = list;
        return null;
      });
      return null;
    });
    console.log(newDeducter);
    setDeducter(newDeducter);
  }, [studentInfo]);

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
    <div className="Grade">
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
        <form noValidate autoComplete="off">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>카테고리</TableCell>
                  <TableCell>감점사유</TableCell>
                  <TableCell width="100px">감점</TableCell>
                  <TableCell width="50%">감점자</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradeInfo.points &&
                  gradeInfo.points.map((point, index) =>
                    point.deducts.map((deduct) => (
                      <StyledTableRow
                        className={`cl-${index % 2}`}
                        style={index % 2 ? { backgroundColor: "#eee" } : {}}
                        key={`${point.pointId}-${deduct.uuid}`}
                      >
                        <TableCell component="th" scope="row">
                          {point.name}
                        </TableCell>
                        <TableCell>{deduct.desc}</TableCell>
                        <TableCell align="center">
                          {deduct.deduct}
                          <div
                            style={{ textAlign: "center", color: "darkblue" }}
                          >
                            {
                              (
                                deducter[`${point.pointId}-${deduct.uuid}`] ||
                                []
                              ).length
                            }
                            /{Object.keys(studentInfo).length} (
                            {Math.round(
                              ((
                                deducter[`${point.pointId}-${deduct.uuid}`] ||
                                []
                              ).length /
                                Object.keys(studentInfo).length) *
                                10000
                            ) / 100}
                            %)
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          {(
                            deducter[`${point.pointId}-${deduct.uuid}`] || []
                          ).join(", ")}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </form>
      </div>
    </div>
  );
}

export default GradeView;
