import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Alert, Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { Prompt } from "react-router";
import { v1 as uuidv1 } from "uuid";
import { firebaseApp } from "../lib/firebaseApp";

import "./Grade.css";

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);
const StyledSumTableRow = withStyles((theme) => ({
  root: {
    "&": {
      backgroundColor: "lightyellow",
    },
    "& > *": {
      fontWeight: "bold",
    },
  },
}))(TableRow);

function Grade(prop) {
  const defaultCurrentScore = {
    hakbun: "",
    points: {},
  };
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [currentScore, setCurrentScore] = useState(defaultCurrentScore);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [needSave, setNeedSave] = useState(false);

  const changeHakbun = (e, nextValue) => {
    console.log(defaultCurrentScore);
    setCurrentScore((state) => ({ ...defaultCurrentScore, hakbun: nextValue }));
    if (Object.keys(studentInfo).includes(nextValue)) {
      console.log("Found User");
      setCurrentScore((state) => ({ ...state, ...studentInfo[nextValue] }));
    }
  };

  console.log(currentScore);

  const changeScorePointState = (pointId, point) => {
    setNeedSave(true);
    console.log("changeScorePointState-setcurrentScore");
    setCurrentScore((state) => {
      const newState = { ...state };
      newState.points[pointId] = {
        point: point,
      };
      return newState;
    });
  };
  const changeScoreDeductState = (pointId, deductReason) => {
    // e.preventDefault();
    setNeedSave(true);
    const newObject = { ...currentScore };
    if (deductReason === null) {
      newObject.points[pointId] = null;
    } else {
      newObject.points[pointId] = {
        ...deductReason,
      };
    }
    console.log("changeScoreDeductState-setcurrentScore");
    setCurrentScore(newObject);
  };

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

  const resetHandler = () => {
    setNeedSave(false);
    console.log("resetHandler-setcurrentScore");
    setCurrentScore(defaultCurrentScore);
  };

  const saveHandler = async () => {
    setSaving(true);
    try {
      // Save Student's data
      setStudentInfo((state) => ({
        ...state,
        [currentScore.hakbun]: currentScore,
      }));
      await firebaseApp
        .firestore()
        .collection("grades")
        .doc(prop.match.params.gradeID)
        .collection("students")
        .doc(currentScore.hakbun)
        .set(currentScore);

      // Update Deduct Information and counts and update.
      const newGradeInfo = [...gradeInfo.points];
      console.log(newGradeInfo);
      Object.keys(currentScore.points).map((pointId) => {
        const index = newGradeInfo.findIndex(
          (point) => point.pointId === pointId
        );
        console.log(currentScore.points[pointId]);
        newGradeInfo[index].deducts = [...(newGradeInfo[index].deducts || [])];
        newGradeInfo[index].deducts.find(
          (deduct) => deduct.uuid === currentScore.points[pointId].uuid
        ) === undefined &&
          newGradeInfo[index].deducts.push(currentScore.points[pointId]);
        return null;
      });
      setGradeInfo((state) => ({
        ...state,
        points: newGradeInfo,
      }));
      console.log(newGradeInfo);

      await firebaseApp
        .firestore()
        .collection("grades")
        .doc(prop.match.params.gradeID)
        .set(gradeInfo);

      setNeedSave(false);
    } catch (e) {
      console.error(e);
      setErrors((state) => [...state, e.toString()]);
    } finally {
      setSaving(false);
    }
  };

  if (needSave) {
    window.onbeforeunload = () => true;
  } else {
    window.onbeforeunload = undefined;
  }
  document.title = `${currentScore.hakbun || "N/A"} 성적`;

  const sum = Object.values(currentScore.points).reduce((prev, curr) => {
    return +Number.parseFloat(prev + +(curr.point || 0)).toFixed(2);
  }, 0);
  return gradeInfo === null || !gradeInfo === {} ? (
    <h1>Error</h1>
  ) : (
    <div className="Grade">
      <Prompt
        when={needSave}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <div>
        {errors.map((error) => (
          <Alert key={error} severity="error">
            {error}
          </Alert>
        ))}
      </div>
      <div>
        <h1>
          {gradeInfo.gradeName}
          {needSave ? "*" : ""}
        </h1>
      </div>
      <Autocomplete
        id="hakbun"
        options={Object.keys(studentInfo)}
        freeSolo
        // getOptionLabel={(option) => option.title}
        style={{ width: 300 }}
        value={currentScore.hakbun}
        renderInput={(params) => (
          <TextField
            {...params}
            label="학번"
            // onChange={changeCurrentScoreState}
            variant="outlined"
          />
        )}
        clearOnBlur
        onChange={changeHakbun}
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
                  <TableCell width="50%">감점사유</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradeInfo.points &&
                  gradeInfo.points.map((point) => (
                    <StyledTableRow key={point.pointId}>
                      <TableCell component="th" scope="row">
                        {point.name}
                      </TableCell>
                      <TableCell align="right">{point.point}</TableCell>
                      <TableCell
                        align="right"
                        onChange={(e) =>
                          changeScorePointState(point.pointId, e.target.value)
                        }
                      >
                        <TextField
                          value={
                            // currentScore.points[point.pointId].point
                            currentScore.points[point.pointId] &&
                            typeof currentScore.points[point.pointId].point ===
                              "number"
                              ? currentScore.points[point.pointId].point
                              : ""
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {/* <TextField fullWidth /> */}

                        <Autocomplete
                          id={`${point.pointId}-deductmsg`}
                          options={[
                            ...(point.deducts || []),
                            { uuid: 0, deduct: 0, desc: "없음" },
                            {
                              uuid: null,
                              deduct: 0.2,
                              desc: "hello",
                            },
                          ]}
                          fullWidth
                          freeSolo
                          clearOnBlur
                          filterOptions={(options, params) => {
                            const filtered = createFilterOptions()(
                              options.filter(
                                (option) =>
                                  option.deduct !== undefined &&
                                  option.desc !== undefined
                              ),
                              params
                            );
                            console.log(filtered);

                            return filtered;
                          }}
                          getOptionLabel={(option) =>
                            `(-${option.deduct}) ${option.desc}`
                          }
                          value={
                            !currentScore.points[point.pointId] ||
                            !currentScore.points[point.pointId].desc
                              ? null
                              : currentScore.points[point.pointId]
                          }
                          onChange={(e, newValue) => {
                            console.log(newValue);
                            if (typeof newValue === "string") {
                              changeScoreDeductState(point.pointId, {
                                uuid: uuidv1(),
                                point: currentScore.points[point.pointId].point,
                                deduct: +Number.parseFloat(
                                  point.point -
                                    (currentScore.points[point.pointId] &&
                                      currentScore.points[point.pointId]
                                        .point) || 0
                                ).toFixed(2),
                                desc: newValue,
                              });
                            } else {
                              changeScoreDeductState(point.pointId, {
                                ...newValue,
                                point: +Number.parseFloat(
                                  point.point -
                                    ((newValue && newValue.deduct) || 0)
                                ).toFixed(2),
                              });
                            }
                            // setTest(newValue);
                          }}
                          // changeScoreDeductState(point.pointId, e)
                          // style={{ width: 300 }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))}
                <StyledSumTableRow>
                  <TableCell component="th" scope="row">
                    합계
                  </TableCell>
                  <TableCell align="right">{gradeInfo.totalPoints}</TableCell>
                  <TableCell align="right">
                    {sum} ({Math.round((sum / gradeInfo.totalPoints) * 100)}%)
                  </TableCell>
                  <TableCell align="center"></TableCell>
                </StyledSumTableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className="buttons">
            <Button variant="contained" onClick={resetHandler}>
              초기화
            </Button>
            <Button
              disabled={!currentScore.hakbun || saving}
              variant="contained"
              color="primary"
              onClick={saveHandler}
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Grade;
