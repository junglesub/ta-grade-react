import { Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { Link } from "react-router-dom";

function GradeButtons(prop) {
  const rootLink = `/grade/${prop.match.params.gradeID}`;
  return (
    <div>
      <Alert severity="warning">
        부분점수 기능은 아직 미완성입니다. 버그가 있을 수 있습니다.
        <br />
        저장과 보기는 되지만 및 내보내기가 작동하지 않습니다.
      </Alert>
      <Button component={Link} to={`${rootLink}`}>
        Grade
      </Button>
      <Button component={Link} to={`${rootLink}/view`}>
        View
      </Button>
      <Button component={Link} to={`${rootLink}/stu`}>
        Stu
      </Button>
      <Button component={Link} to={`${rootLink}/download`}>
        Download
      </Button>
      <Button component={Link} to={`${rootLink}/hisnet`}>
        Hisnet
      </Button>
      <Button component={Link} to={`${rootLink}/delete`} color="secondary">
        Delete
      </Button>
      <Button component={Link} to={`/grade/add`} color="primary">
        Add
      </Button>
    </div>
  );
}

export default GradeButtons;
