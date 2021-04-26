import { Grid, Paper, TextField } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import engHanguel from "../lib/engHanguel";

import "./GradeNew.css";

function GradeNew() {
  const [gradeName, setGradeName] = useState({
    kor: "",
    eng: "",
  });
  const [gradePoints, setGradePoints] = useState([]);

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
  console.log(gradePoints);

  return (
    <div className="GradeNew">
      <form noValidate autoComplete="off">
        <div>
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
              value={gradePoints.reduce(
                (prev, curr) => (prev += +curr.point || 0),
                0
              )}
            />
          </div>
          <hr />
          <div>{inputFieldsContent()}</div>
        </div>
      </form>
    </div>
  );
}

export default GradeNew;
