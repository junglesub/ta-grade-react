import {
  Button,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import GetLogin from "../components/hisnet/GetLogin";
import { firebaseApp } from "../lib/firebaseApp";

import "./StudentView.css";
import GetClass from "../components/hisnet/GetClass";
import GetHomework from "../components/hisnet/GetHomework";
import GetStudents from "../components/hisnet/GetStudents";
import SendGrade from "../components/hisnet/SendGrade";
import axios from "axios";
import { url_config } from "../url_config";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function ExportToHisnet(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors, setErrors] = useState([]);

  const [classInfo, setClassInfo] = useState({});
  const [homeworkInfo, setHomeworkInfo] = useState({});
  const [hakbuns, setHakbuns] = useState(undefined);
  const [selectedStudent, setSelectedStudent] = React.useState([]);

  // User Hisnet Data
  const [token, setToken] = useState("");

  // Get 성적 Grade
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
  console.log(studentInfo);

  // Start Steps
  // Need to optimize using react hooks
  const getSteps = () => {
    return [
      `Hisnet 로그인 (${token && jwt.decode(token).hisnetId})`,
      classInfo.name
        ? `[${classInfo.code}-${classInfo.ban}] ${classInfo.name}`
        : "TA 과목 확인 및 선택",
      homeworkInfo.title || "과목 과제 리스트 확인 및 선택",
      `학생선택`,
      "내보내기",
    ];
  };

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [finishedStep, setFinishedStep] = React.useState([
    Array(steps.length).fill(false),
  ]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  // End Steps

  function getStepContent(step) {
    switch (step) {
      case 0:
        return !token ? <GetLogin setToken={setToken} /> : <p>로그인 완료</p>;
      case 1:
        return (
          <GetClass
            token={token}
            value={classInfo}
            changeClass={setClassInfo}
          />
        );
      case 2:
        return (
          <GetHomework
            token={token}
            classInfo={classInfo}
            value={homeworkInfo}
            setHomeworkInfo={setHomeworkInfo}
          />
        );
      case 3:
        return (
          <GetStudents
            token={token}
            classInfo={classInfo}
            homeworkInfo={homeworkInfo}
            hakbuns={hakbuns}
            setHakbuns={setHakbuns}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
          />
        );
      case 4:
        return (
          <SendGrade
            token={token}
            classInfo={classInfo}
            homeworkInfo={homeworkInfo}
            hakbuns={hakbuns}
            selectedStudent={selectedStudent}
            gradeInfo={gradeInfo}
            studentInfo={studentInfo}
          />
        );
      default:
        return "Unknown step";
    }
  }

  useEffect(
    () => setFinishedStep((state) => [!!token, ...state.slice(1)]),
    [token]
  );
  useEffect(
    () =>
      setFinishedStep((state) => [
        !!token,
        classInfo !== {},
        ...state.slice(2),
      ]),
    [classInfo, token]
  );
  useEffect(
    () =>
      setFinishedStep((state) => [
        !!token,
        !!classInfo.name,
        !!homeworkInfo.title,
        ...state.slice(3),
      ]),
    [classInfo, token, homeworkInfo]
  );
  useEffect(
    () =>
      setFinishedStep((state) => [
        !!token,
        !!classInfo.name,
        !!homeworkInfo.title,
        !!selectedStudent.length,
        ...state.slice(4),
      ]),
    [classInfo, token, homeworkInfo, selectedStudent]
  );
  console.log(jwt.decode(token), { finishedStep });

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
        // firestoreDoc
        //   .collection("students")
        //   .get()
        //   .then((docs) =>
        //     setStudentInfo(
        //       docs.docs.reduce(
        //         (prev, curr) => ({
        //           ...prev,
        //           [curr.id]: curr.data(),
        //         }),
        //         {}
        //       )
        //     )
        //   )
        //   .catch((err) => {
        //     console.error(err);
        //   });
      })
      .catch((err) => {
        console.error(err);
        setGradeInfo(null);
      });
  }, [prop.match.params.gradeID]);

  document.title = `${prop.match.params.gradeID} 내보내기`;

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
      <h1>히즈넷으로 내보내기</h1>
      <em>[경고] 아직 테스트 중입니다. 문제가 발생할 수 있습니다!!</em>
      <div>
        <h1>{gradeInfo.gradeName}</h1>
      </div>
      <div>
        <p>사용 완료 후에 로그아웃 버튼을 꼭!! 눌러주세요.</p>
        <Button
          color="secondary"
          disabled={!token}
          onClick={() => {
            axios
              .post(`${url_config.hisnet_grade}/signout`, {
                token,
              })
              .then(() => setToken(""));
          }}
        >
          Logout
        </Button>
      </div>

      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!finishedStep[activeStep]}
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </div>
    </div>
  );
}

export default ExportToHisnet;
