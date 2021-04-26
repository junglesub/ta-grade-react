import { Button, Grid, Paper, TextField } from "@material-ui/core";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import engHanguel from "../lib/engHanguel";
import { firebaseApp } from "../lib/firebaseApp";
import { userStore } from "../stores/userStore";

import "./GradeNew.css";

function GradeNew(props) {
  const { currentUser } = useContext(userStore).state;

  const [gradeName, setGradeName] = useState({
    kor: "",
    eng: "",
  });
  const [gradePoints, setGradePoints] = useState([]);

  const totalPoints = gradePoints.reduce(
    (prev, curr) => (prev += +curr.point || 0),
    0
  );

  // TODO: Need to optimize this
  const changeGradeName = (e) => {
    const name = e.target.value;
    const engName = engHanguel(name);
    setGradeName({ kor: name, eng: engName });
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

    newValue = [
      ...newValue.slice(0, index),
      {
        pointId: `${gradeName.eng}-${index}`,
        ...newValue[index],
        [type]: target.value,
      },
      ...newValue.slice(index + 1),
    ];

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
  const saveToFirebase = () => {
    firebaseApp
      .firestore()
      .collection("grades")
      .doc(gradeName.eng)
      .set({
        gradeName: gradeName.kor,
        owner: currentUser.uid,
        ownerEmail: currentUser.email,
        totalPoints,
        points: gradePoints,
      })
      .then(() => {
        props.history.push(`/grade/${gradeName.eng}`);
      })
      .catch((err) => console.error(err));
  };

  console.log(gradePoints);
  return (
    <div className="GradeNew">
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
              id="input-totalPointes"
              label="totalPoints"
              value={totalPoints}
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
        >
          등록
        </Button>
      </form>
    </div>
  );
}

export default GradeNew;
