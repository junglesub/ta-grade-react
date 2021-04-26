import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

const options = ["22000462"];

function Grade(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});

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
  }, []);

  console.log(prop);
  return gradeInfo === null || !gradeInfo === {} ? (
    <h1>Error</h1>
  ) : (
    <div className="Grade">
      <Autocomplete
        id="hakbun"
        options={options}
        // getOptionLabel={(option) => option.title}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="학번" variant="outlined" />
        )}
      />
      <div>
        <form noValidate autoComplete="off">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>설명</TableCell>
                  <TableCell width="100px">최고점수</TableCell>
                  <TableCell width="100px">점수</TableCell>
                  <TableCell>감점사유</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradeInfo.points &&
                  gradeInfo.points.map((point) => (
                    <TableRow key={point.name}>
                      <TableCell component="th" scope="row">
                        {point.name}
                      </TableCell>
                      <TableCell align="right">{point.point}</TableCell>
                      <TableCell align="right">
                        <TextField />
                      </TableCell>
                      <TableCell align="center">
                        <TextField fullWidth />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </form>
      </div>
    </div>
  );
}

export default Grade;
