import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

import "./Grade.css";
import { useHistory } from "react-router";

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

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

function GradeView(prop) {
  const history = useHistory();
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors /*, setErrors*/] = useState([]);
  const [deducter, setDeducter] = useState({});
  const [changing, setChanging] = useState("");
  const [changedValue, setChangedValue] = useState({});
  const [savingInProgress, setSavingInProgress] = useState({
    progress: -1,
    messages: [],
  });

  const startEditMode = (name, point, deduct) => {
    setChanging(name);
    setChangedValue({
      pointname: point.name,
      deductdesc: deduct.desc,
      deductdeduct: deduct.deduct,
    });
    console.log(name);
  };

  const addMessageToProgress = (message, progress = null) => {
    setSavingInProgress((state) => ({
      progress: progress === null ? state.progress : progress,
      messages: [...state.messages, message],
    }));
  };

  const finishEditMode = async (pointId, point, deduct) => {
    setSavingInProgress((state) => ({
      messages: ["저장을 시작합니다!"],
      progress: 0,
    }));

    point.name = changedValue.pointname;
    deduct.desc = changedValue.deductdesc;
    deduct.deduct = changedValue.deductdeduct;
    deduct.point = +Number.parseFloat(point.point - deduct.deduct).toFixed(2);

    const foundIndex = point.deducts.findIndex(
      (elem) => elem.uuid === deduct.uuid
    );
    if (foundIndex > 0) {
      point.deducts[foundIndex] = deduct;
    }

    console.log(point, deduct);

    // Ready to Save
    const pointIndex = gradeInfo.points.findIndex((p) => p.pointId === pointId);
    const firestoreDoc = firebaseApp
      .firestore()
      .collection("grades")
      .doc(prop.match.params.gradeID);

    try {
      if (pointIndex === -1) throw new Error("Update Point Not Found!");

      // Need to update this amount of people
      const needToUpdateStudent = deducter[`${pointId}-${deduct.uuid}`];
      const totalSteps = (needToUpdateStudent || []).length + 1;
      addMessageToProgress("Total Steps: " + totalSteps);

      const newGradeInfo = { ...gradeInfo };
      newGradeInfo.points[pointIndex] = point;
      await firestoreDoc.set(newGradeInfo);
      addMessageToProgress("Updated GradeInfo", (1 / totalSteps) * 100);

      // TODO: If deduct data is same, no need to update.

      // Update Students Information
      for (let index = 0; index < needToUpdateStudent.length; index++) {
        const hakbun = needToUpdateStudent[index];

        const updatingStudent = { ...studentInfo[hakbun] };
        updatingStudent.points[pointId] = deduct;
        addMessageToProgress(`Updating ${index} - ${hakbun}`);
        await firestoreDoc
          .collection("students")
          .doc(hakbun)
          .set(updatingStudent);
        addMessageToProgress(
          `Completed ${index} - ${hakbun}`,
          ((2 + index) / totalSteps) * 100
        );
      }

      // Last Reload the page
      addMessageToProgress("Finished", 100);
      // window.location.reload();
    } catch (e) {
      console.error(e);
      addMessageToProgress("ERROR: " + e.toString(), 100);
    } finally {
      addMessageToProgress("Done.", 100);
    }
  };

  const changeEditField = (event) => {
    console.log(event.target.name);
    setChangedValue((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }));
  };

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
      <Dialog open={savingInProgress.progress >= 0} fullWidth>
        <DialogContent>
          <div style={{ textAlign: "center" }}>
            <CircularProgressWithLabel value={savingInProgress.progress} />
          </div>
          <Alert severity="info">
            {savingInProgress.messages.map((msg) => (
              <div key={msg}>{msg}</div>
            ))}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={savingInProgress.progress !== 100}
            onClick={() => history.go(0)}
            color="primary"
            autoFocus
          >
            Reload
          </Button>
        </DialogActions>
      </Dialog>
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
                          {changing === "" ? (
                            <IconButton
                              name={`${point.pointId}-${deduct.uuid}`}
                              size="small"
                              aria-label="edit"
                              onClick={() =>
                                startEditMode(
                                  `${point.pointId}-${deduct.uuid}`,
                                  point,
                                  deduct
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            changing === `${point.pointId}-${deduct.uuid}` && (
                              <IconButton
                                aria-label="done"
                                size="small"
                                onClick={() => {
                                  finishEditMode(point.pointId, point, deduct);
                                }}
                              >
                                <DoneIcon fontSize="small" />
                              </IconButton>
                            )
                          )}

                          {changing === `${point.pointId}-${deduct.uuid}` ? (
                            <TextField
                              name="pointname"
                              onChange={changeEditField}
                              value={changedValue.pointname}
                            />
                          ) : (
                            point.name
                          )}
                        </TableCell>
                        <TableCell>
                          {changing === `${point.pointId}-${deduct.uuid}` ? (
                            <TextField
                              name="deductdesc"
                              multiline
                              onChange={changeEditField}
                              value={changedValue.deductdesc}
                            />
                          ) : (
                            deduct.desc
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {changing === `${point.pointId}-${deduct.uuid}` ? (
                            <TextField
                              name="deductdeduct"
                              onChange={changeEditField}
                              value={changedValue.deductdeduct}
                            />
                          ) : (
                            -deduct.deduct
                          )}{" "}
                          ({point.point})
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
