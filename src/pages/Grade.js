import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Alert, Autocomplete, createFilterOptions } from "@material-ui/lab";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Prompt } from "react-router";
import { v1 as uuidv1 } from "uuid";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

import "./Grade.css";
import { Add } from "@material-ui/icons";

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

const useProfileStyle = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: 280,
    position: "relative", // For eyeball
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    width: 151,
  },
}));

function AddMultiInput({ addMulti }) {
  const [deduct, setDeduct] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div>
      <TextField
        label="감점"
        size="small"
        className="multiDeduct"
        onChange={(e) => setDeduct(e.target.value)}
        value={deduct}
      />{" "}
      <TextField
        label="Size"
        size="small"
        onChange={(e) => setReason(e.target.value)}
        value={reason}
      />
      <IconButton
        aria-label="add"
        size="small"
        onClick={() => {
          addMulti(+deduct, reason);
          setDeduct("");
          setReason("");
        }}
      >
        <Add fontSize="inherit" />
      </IconButton>
    </div>
  );
}

function Grade(prop) {
  const defaultCurrentScore = {
    hakbun: "",
    points: {},
    late: false,
  };
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [currentScore, setCurrentScore] = useState(defaultCurrentScore);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [needSave, setNeedSave] = useState(false);
  const [assumeFullCredit, setAssumeFullCredit] = useState(false);
  const [studentPInfo, setStudentPInfo] = useState({});
  const [apiKey, setApiKey] = useState("");
  const [visPro, setVisPro] = useState(
    localStorage.getItem("visPro") === "true" || false
  );
  const { currentUser } = useContext(userStore).state;

  useEffect(() => {
    if (!apiKey || !currentScore.hakbun) {
      setStudentPInfo({});
      return;
    }
    setStudentPInfo({ loading: true });
    axios
      .get(
        `https://6lb9wtlfja.execute-api.us-east-1.amazonaws.com/dev/my-api?hakbun=${currentScore.hakbun}`,
        {
          headers: {
            "x-api-key": apiKey,
          },
        }
      )
      .then((doc) => {
        setStudentPInfo(doc.data);
      });
  }, [currentScore.hakbun, apiKey]);

  useEffect(() => {
    firebaseApp
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .get()
      .then((data) => setApiKey((data.data() && data.data().apikey) || ""));
  }, [currentUser]);

  const changeHakbun = (e, nextValue) => {
    console.log(defaultCurrentScore);
    if (Object.keys(studentInfo).includes(nextValue)) {
      console.log("Found User");
      setCurrentScore({
        ...defaultCurrentScore,
        hakbun: nextValue,
        ...studentInfo[nextValue],
      });
    } else {
      console.log("New User");
      const currentScore = {
        ...defaultCurrentScore,
        hakbun: nextValue,
        points: gradeInfo.points.reduce((prev, curr) => {
          if (curr.multiDeduct) {
            return {
              ...prev,
              [curr.pointId]: {
                multi: [],
                point: curr.point,
              },
            };
          } else if (assumeFullCredit)
            return {
              ...prev,
              [curr.pointId]: {
                uuid: 0,
                deduct: 0,
                desc: "없음",
                point: curr.point,
              },
            };
          return { ...prev };
        }, {}),
      };
      console.log(currentScore);
      /*
      assumeFullCredit
          ? gradeInfo.points.reduce(
              (prev, curr) => ({
                ...prev,
                [curr.pointId]: {
                  uuid: 0,
                  deduct: 0,
                  desc: "없음",
                  point: curr.point,
                },
              }),
              {}
            )
          : {},
      */
      setCurrentScore(currentScore);
      setNeedSave(true);
      if (assumeFullCredit) {
        console.log("STATE:", currentScore);
        console.log("before", currentScore);
        saveHandler(currentScore);
      }
    }
  };

  const onToggleMultiSelect = (point, item, e, nv) => {
    console.log(point, item, e, nv);
    const newObject = { ...currentScore };
    let multi =
      (newObject.points[point.pointId] &&
        newObject.points[point.pointId].multi) ||
      [];

    if (nv) multi.push(item);
    else {
      multi = multi.filter(
        (curr) => !(curr.deduct === item.deduct && curr.reason === item.reason)
      );
    }

    newObject.points[point.pointId] = {
      multi,
      point: +Number.parseFloat(
        point.point - multi.reduce((prev, curr) => (prev += curr.deduct), 0)
      ).toFixed(2),
    };
    setCurrentScore(newObject);
  };

  const changeVisibility = () => {
    localStorage.setItem("visPro", !visPro);
    setVisPro((state) => !state);
  };

  const changeScorePointState = (pointId, point) => {
    if (!currentScore.hakbun || saving) return;
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
    if (!currentScore.hakbun || saving) return;
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

  const lateHandler = (event, nextValue) => {
    console.log(nextValue);
    setNeedSave(true);
    setCurrentScore((state) => ({
      ...state,
      late: nextValue,
    }));
  };

  const resetHandler = () => {
    setNeedSave(false);
    console.log("resetHandler-setcurrentScore");
    setCurrentScore(defaultCurrentScore);
  };

  const saveHandler = async (currentScore) => {
    console.log("Saving", currentScore);
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
  document.title = `${needSave ? "*" : ""}${currentScore.hakbun || "N/A"} 성적`;

  // Profile

  const profileClasses = useProfileStyle();

  if (gradeInfo === null || !gradeInfo === {}) return <h1>Error</h1>;

  const sum = +Number.parseFloat(
    Object.values(currentScore.points).reduce((prev, curr) => {
      return prev + +(curr.point || 0);
    }, 0) * (currentScore.late ? 1 - gradeInfo.late_deduct : 1)
  ).toFixed(2);
  return (
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
      <Grid container justify="space-between">
        <Grid item>
          <div>
            <h1>
              {gradeInfo.gradeName}
              {needSave ? "*" : ""}
            </h1>
          </div>
          <Autocomplete
            id="hakbun"
            options={Object.keys(studentInfo)}
            disabled={needSave}
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
            <h4>Options</h4>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assumeFullCredit}
                  onChange={(event) => {
                    setAssumeFullCredit(event.target.checked);
                  }}
                  name="assumefullcredit"
                />
              }
              label="새로운 학생 추가시 만점으로 저장"
            />
          </div>
        </Grid>
        <Grid item>
          {Object.keys(studentPInfo).length !== 0 && (
            <Card className={profileClasses.root}>
              <IconButton
                style={{
                  position: "absolute",
                  right: 0,
                }}
                onClick={changeVisibility}
              >
                {visPro ? <Visibility /> : <VisibilityOff />}
              </IconButton>
              {studentPInfo.loading ? (
                <CircularProgress />
              ) : (
                <>
                  <div className={profileClasses.details}>
                    <CardContent className={profileClasses.content}>
                      <h3>{studentPInfo.name}</h3>
                      <p>{currentScore.hakbun}</p>
                      {visPro && <p>{studentPInfo.pho}</p>}
                    </CardContent>
                  </div>

                  <CardMedia
                    className={profileClasses.cover}
                    title={`${currentScore.hakbun}-i`}
                    image={
                      visPro
                        ? studentPInfo.i
                        : "https://upload.wikimedia.org/wikipedia/en/c/c8/HGUseal.png"
                    }
                  />
                </>
              )}
            </Card>
          )}
        </Grid>
      </Grid>
      <div>
        <form noValidate autoComplete="off">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>설명</TableCell>
                  <TableCell width="80px">점수</TableCell>
                  <TableCell width="50%">감점사유</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradeInfo.points &&
                  gradeInfo.points.map((point, index) => (
                    <StyledTableRow key={point.pointId}>
                      <TableCell component="th" scope="row">
                        {point.name}
                      </TableCell>
                      <TableCell
                        align="right"
                        onChange={(e) =>
                          changeScorePointState(point.pointId, e.target.value)
                        }
                      >
                        <TextField
                          disabled={point.multiDeduct}
                          value={
                            // currentScore.points[point.pointId].point
                            currentScore.points[point.pointId] &&
                            currentScore.points[point.pointId].point !==
                              undefined
                              ? currentScore.points[point.pointId].point
                              : ""
                          }
                        />
                        /{point.point}
                      </TableCell>
                      <TableCell align="center">
                        {/* <TextField fullWidth /> */}

                        {point.multiDeduct ? (
                          <div>
                            <div>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  부분감점
                                </FormLabel>
                                <FormGroup>
                                  {point.multiReason.map((item) => {
                                    console.log(
                                      currentScore.points[point.pointId]
                                    );
                                    return (
                                      <FormControlLabel
                                        key={`${item.deduct}${item.reason}`}
                                        control={
                                          <Checkbox
                                            checked={
                                              currentScore.points[
                                                point.pointId
                                              ] &&
                                              currentScore.points[point.pointId]
                                                .multi
                                                ? currentScore.points[
                                                    point.pointId
                                                  ].multi.find(
                                                    (search) =>
                                                      search.deduct ===
                                                        item.deduct &&
                                                      search.reason ===
                                                        item.reason
                                                  ) !== undefined
                                                : false
                                            }
                                            onChange={(e, nv) =>
                                              onToggleMultiSelect(
                                                point,
                                                item,
                                                e,
                                                nv
                                              )
                                            }
                                            name={`(-${item.deduct}) ${item.reason}`}
                                          />
                                        }
                                        label={`(-${item.deduct}) ${item.reason}`}
                                      />
                                    );
                                  })}
                                </FormGroup>
                                {/* <FormHelperText>Be careful</FormHelperText> */}
                              </FormControl>
                              {/* {point.multiReason.map((item) => )} */}
                            </div>
                            <AddMultiInput
                              addMulti={(deduct, reason) => {
                                const newPoint = [...gradeInfo.points];
                                newPoint[index].multiReason.push({
                                  deduct,
                                  reason,
                                });
                                // console.log(gradeInfo);
                                console.log({
                                  ...gradeInfo,
                                  points: newPoint,
                                });
                                setGradeInfo((state) => ({
                                  ...state,
                                  points: newPoint,
                                }));
                                return;
                              }}
                            />
                          </div>
                        ) : (
                          <Autocomplete
                            id={`${point.pointId}-deductmsg`}
                            options={[
                              ...(point.deducts || []),
                              { uuid: 0, deduct: 0, desc: "없음" },
                              {
                                uuid: -1,
                                deduct: "N/A",
                                desc: "다중 감점 모드",
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
                                  point:
                                    currentScore.points[point.pointId].point,
                                  deduct: +Number.parseFloat(
                                    point.point -
                                      (currentScore.points[point.pointId] &&
                                        currentScore.points[point.pointId]
                                          .point) || 0
                                  ).toFixed(2),
                                  desc: newValue,
                                });
                              } else {
                                // 다중감점 모드일시
                                if (newValue !== null && newValue.uuid < 0) {
                                  switch (newValue.uuid) {
                                    case -1:
                                      const newPoint = [...gradeInfo.points];
                                      newPoint[index].multiDeduct = true;
                                      newPoint[index].multiReason = [];
                                      // console.log(gradeInfo);
                                      console.log({
                                        ...gradeInfo,
                                        points: newPoint,
                                      });
                                      setGradeInfo((state) => ({
                                        ...state,
                                        points: newPoint,
                                      }));
                                      return;
                                    default:
                                  }
                                  return;
                                }
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
                        )}
                      </TableCell>
                    </StyledTableRow>
                  ))}
                <StyledTableRow>
                  <TableCell component="th" scope="row">
                    Late
                  </TableCell>
                  <TableCell align="right">
                    {(gradeInfo.late_deduct || 0) * 100}%
                  </TableCell>
                  <TableCell>
                    {
                      +Number.parseFloat(
                        currentScore.late
                          ? sum - sum / (1 - (gradeInfo.late_deduct || 0))
                          : sum * -(gradeInfo.late_deduct || 0)
                      ).toFixed(2)
                    }
                    <Checkbox
                      checked={currentScore.late || false}
                      onChange={lateHandler}
                    />
                  </TableCell>
                </StyledTableRow>
                <StyledSumTableRow>
                  <TableCell component="th" scope="row">
                    합계
                  </TableCell>
                  <TableCell align="right">
                    {sum}/{gradeInfo.totalPoints} (
                    {Math.round((sum / gradeInfo.totalPoints) * 100)}%)
                  </TableCell>
                  <TableCell align="center"></TableCell>
                </StyledSumTableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className="buttons">
            <Button variant="contained" onClick={resetHandler}>
              취소
            </Button>
            <Button
              disabled={!currentScore.hakbun || saving}
              variant="contained"
              color="primary"
              onClick={() => saveHandler(currentScore)}
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
