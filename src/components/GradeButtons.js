import { Button } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

function GradeButtons(prop) {
  const rootLink = `/grade/${prop.match.params.gradeID}`;
  return (
    <div>
      <Button component={Link} to={`${rootLink}`}>
        Grade
      </Button>
      <Button component={Link} to={`${rootLink}/view`}>
        View
      </Button>
      <Button component={Link} to={`${rootLink}/download`}>
        Download
      </Button>
      <Button component={Link} to={`/grade/add`} color="primary">
        Add
      </Button>
    </div>
  );
}

export default GradeButtons;
