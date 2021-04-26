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
import { withStyles } from "@material-ui/core/styles";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { firebaseApp } from "../lib/firebaseApp";

const options = ["22000462"];

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
  const [test1, setTest] = useState("");

  const changeCurrentScoreState = (e) => {
    if (e.target.name === "hakbun") {
      setCurrentScore({ ...defaultCurrentScore, hakbun: e.target.value });
    } else {
      setCurrentScore((state) => ({
        score: { [e.target.name]: e.target.value },
        ...state,
      }));
    }
  };

  console.log(currentScore);

  const changeScorePointState = (pointId, point) => {
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
    const newObject = { ...currentScore };
    if (deductReason === null) {
      newObject.points[pointId] = null;
    } else {
      newObject.points[pointId] = {
        ...deductReason,
      };
    }
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
  }, []);

  const sum = Object.values(currentScore.points).reduce((prev, curr) => {
    return prev + +(curr.point || 0);
  }, 0);
  return gradeInfo === null || !gradeInfo === {} ? (
    <h1>Error</h1>
  ) : (
    <div className="Grade">
      <div>
        <h1>{gradeInfo.gradeName}</h1>
      </div>
      <Autocomplete
        id="hakbun"
        options={options}
        freeSolo
        // getOptionLabel={(option) => option.title}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField
            {...params}
            name="hakbun"
            label="학번"
            onChange={changeCurrentScoreState}
            variant="outlined"
          />
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
                            (currentScore.points[point.pointId] &&
                              currentScore.points[point.pointId].point) ||
                            ""
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {/* <TextField fullWidth /> */}

                        <Autocomplete
                          id={`${point.pointId}-deductmsg`}
                          options={[
                            { deduct: 0, desc: "없음" },
                            {
                              deduct: 0.2,
                              desc: "hello",
                            },
                          ]}
                          fullWidth
                          freeSolo
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
                                point: currentScore.points[point.pointId].point,
                                deduct:
                                  point.point -
                                    (currentScore.points[point.pointId] &&
                                      currentScore.points[point.pointId]
                                        .point) || 0,
                                desc: newValue,
                              });
                            } else {
                              changeScoreDeductState(point.pointId, {
                                ...newValue,
                                point: point.point - newValue.deduct,
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
        </form>
      </div>
    </div>
  );
}

export default Grade;
