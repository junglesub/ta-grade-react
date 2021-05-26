import { Button, Grid, TextField } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import engHanguel from "../lib/engHanguel";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

import "./GradeNew.css";

function GradeNew(props) {
  const { currentUser } = useContext(userStore).state;

  const [errors, setErrors] = useState([]);
  const [gradeName, setGradeName] = useState({
    kor: "",
    eng: "",
  });
  const [gradePoints, setGradePoints] = useState([]);

  const [latededuct, setLateDeduct] = useState(0.2);

  const totalPoints = gradePoints.reduce(
    (prev, curr) => (prev += +curr.point || 0),
    0
  );

  // TODO: Need to optimize this
  const changeGradeName = (e) => {
    const name = e.target.value;
    const engName = engHanguel(name);
    setGradeName({ kor: name, eng: engName.replace(/\s/g, "-") });
  };

  const onInputFieldChange = ({ target }) => {
    const elemId = target.id.split("-");
    const index = elemId[1];
    const type = elemId[3];

    let newValue = [...gradePoints];

    // If index is higher than gradePoints length
    if (index >= gradePoints.length) {
      newValue = [...newValue, ...Array(gradePoints.length - index)];
    }

    newValue[index] = {
      pointId: `${gradeName.eng}-${index}`,
      ...newValue[index],
      [type]: target.value,
    };

    setGradePoints(newValue);

    // switch(type) {
    //   case "name":
    //     setGradePoints
    // }

    console.log(index, type);
  };

  const inputFieldsContent = () => {
    const content = [];
    for (let i = 0; i < gradePoints.length + 1; i++) {
      content.push(
        <Grid container key={i}>
          <Grid item>
            <TextField
              variant="outlined"
              id={`input-${i}-point-name`}
              label="채점내용"
              onChange={onInputFieldChange}
            />
          </Grid>
          <Grid item>
            <TextField
              className="point"
              variant="outlined"
              id={`input-${i}-point-point`}
              label="배점"
              onChange={onInputFieldChange}
            />
          </Grid>
        </Grid>
      );
    }
    return content;
  };
  const saveToFirebase = async () => {
    try {
      const exists = await firebaseApp
        .firestore()
        .collection("grades")
        .doc(gradeName.eng)
        .get()
        .then(() => true)
        .catch(() => false);

      if (exists) throw new Error("Already Exists");

      await firebaseApp
        .firestore()
        .collection("grades")
        .doc(gradeName.eng)
        .set({
          gradeName: gradeName.kor,
          owner: currentUser.uid,
          ownerEmail: currentUser.email,
          totalPoints,
          points: gradePoints,
          late_deduct: latededuct,
        });
      props.history.push(`/grade/${gradeName.eng}`);
    } catch (err) {
      console.error(err);
      setErrors((state) => [...state, err.toString()]);
    }
  };

  console.log(gradePoints);
  return (
    <div className="GradeNew">
      {errors.map((error) => (
        <Alert key={error} severity="error">
          {error}
        </Alert>
      ))}
      <form noValidate autoComplete="off">
        <div>
          <p>
            Current User {currentUser.email} ({currentUser.uid})
          </p>
          <div>
            <TextField
              variant="outlined"
              id="input-grade-name"
              label="Grade Name"
              onChange={changeGradeName}
            />
            <div>ID: {gradeName.eng}</div>
            <TextField
              variant="outlined"
              id="input-latededuct"
              label="Late Deduct"
              value={latededuct}
              InputProps={{
                style: {
                  color: "red",
                },
              }}
              onChange={(e) => setLateDeduct(e.target.value)}
            />
            <TextField
              variant="outlined"
              id="input-totalPointes"
              label="totalPoints"
              value={totalPoints}
              disabled
            />
          </div>
          <hr />
          <div>{inputFieldsContent()}</div>
        </div>
        <Button
          className="submitButton"
          variant="contained"
          color="primary"
          onClick={saveToFirebase}
          disabled={!gradeName.eng}
        >
          등록
        </Button>
      </form>
    </div>
  );
}

export default GradeNew;
