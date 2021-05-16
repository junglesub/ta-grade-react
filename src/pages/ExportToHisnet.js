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
import GetLogin from "../components/hisnet/GetLogin";
import { firebaseApp } from "../lib/firebaseApp";

import "./StudentView.css";

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

function getSteps() {
  return [
    "Hisnet 로그인",
    "TA 과목 확인 및 선택",
    "과목 과제 리스트 확인 및 선택",
    "성적 내보내기",
  ];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <GetLogin />;
    case 1:
      return "An ad group contains one or more ads which target a shared set of keywords.";
    case 2:
      return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
    case 3:
      return <b>Hello World!</b>;
    default:
      return "Unknown step";
  }
}

function ExportToHisnet(prop) {
  const [gradeInfo, setGradeInfo] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [errors, setErrors] = useState([]);

  // Start Steps
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [finishedStep, setFinishedStep] = [Array(steps.length).fill(false)];

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
      <h1>히즈넷으로 내보내기</h1>
      <em>[경고] 아직 테스트 중입니다. 문제가 발생할 수 있습니다!!</em>
      <div>
        <h1>{gradeInfo.gradeName}</h1>
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

      {/* 아래는 레퍼런스 */}
      <div>
        {studentInfo &&
          Object.values(studentInfo).map((student, index) => (
            <div key={student.hakbun} className="onestu">
              <h3>{student.hakbun}</h3>
              <Button onClick={copyToClipboard}>클립보드 복사</Button>
              <h4>
                총점:{" "}
                {
                  +Number.parseFloat(
                    Object.values(student.points).reduce((prev, curr) => {
                      return prev + +(curr.point || 0);
                    }, 0) * (student.late ? 1 - gradeInfo.late_deduct : 1)
                  ).toFixed(2)
                }
                {/* {Object.values(student.points).reduce((prev, curr) => {
                  return +Number.parseFloat(prev + +(curr.point || 0)).toFixed(
                    2
                  );
                }, 0)} */}
              </h4>
              <div className="deduct">
                {Object.keys(student.points)
                  .filter((pointId) => student.points[pointId].deduct > 0)
                  .sort((a, b) => +a.split("-")[1] - +b.split("-")[1])
                  .map((pointId) => (
                    <div key={pointId}>
                      <div>
                        (-{student.points[pointId].deduct}){" "}
                        {student.points[pointId].desc}
                      </div>
                    </div>
                  ))}
                {student.late && (
                  <div>Late: {(gradeInfo.late_deduct || 0) * 100}% 감점</div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ExportToHisnet;
