import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import axios from "axios";
import { url_config } from "../../url_config";
import { Button } from "@material-ui/core";
import { gradeReasonCombine } from "../../lib/gradeReasonCombine";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SendGrade({
  token,
  classInfo,
  homeworkInfo,
  hakbuns,
  selectedStudent,
  gradeInfo,
  studentInfo,
}) {
  const classes = useStyles();
  const [response, setResponse] = useState({});

  const updateScore = () => {
    const allUpdates = selectedStudent.map((value) => {
      return new Promise((res, rej) => {
        if (!studentInfo[value]) {
          setResponse((state) => ({ ...state, [value]: "Grade Not Found..." }));
          res();
          return;
        }

        // Combine student Info point data
        const student = gradeReasonCombine(studentInfo[value]);

        setResponse((state) => ({ ...state, [value]: "Updating..." }));
        axios
          .post(`${url_config.hisnet_grade}/score`, {
            token,
            code: classInfo.code,
            ban: classInfo.ban,
            contentId: homeworkInfo.contentId,
            hakbuns,
            hakbun: value,
            point: student
              ? +Number.parseFloat(
                  Object.values(student.points).reduce((prev, curr) => {
                    return prev + +(curr.point || 0);
                  }, 0) * (student.late ? 1 - gradeInfo.late_deduct : 1)
                ).toFixed(2)
              : 0,
            content: student
              ? Object.keys(student.points)
                  .filter(
                    (pointId) =>
                      student.points[pointId].deduct > 0 ||
                      student.points[pointId].multi
                  )
                  .sort((a, b) => +a.split("-")[1] - +b.split("-")[1])
                  .map((pointId) =>
                    student.points[pointId].multi
                      ? student.points[pointId].multi
                          .filter((m) => m.deduct !== 0)
                          .map((m) => `(-${m.deduct}) ${m.reason}`)
                          .join("\n")
                      : `(-${student.points[pointId].deduct}) ${student.points[pointId].desc}`
                  )
                  .join("\n") +
                (student.late
                  ? `\n\nLate: ${(gradeInfo.late_deduct || 0) * 100}% 감점`
                  : "")
              : "",
          })
          .then(() => {
            setResponse((state) => ({ ...state, [value]: "Updated..." }));
          })
          .catch((e) => {
            setResponse((state) => ({
              ...state,
              [value]: `Error: ${e.toString()}`,
            }));
          })
          .finally(() => {
            res();
          });
      });
    });
    Promise.all(allUpdates);
  };

  return selectedStudent === null ? (
    <p>Loading...</p>
  ) : !selectedStudent ? (
    <p>Unknown Error</p>
  ) : (
    <div>
      <Button onClick={updateScore}>업로드</Button>
      <List dense className={classes.root}>
        {[...selectedStudent].map((value) => {
          const labelId = `checkbox-list-secondary-label-${value}`;
          return (
            <ListItem key={value} button>
              {/* <ListItemAvatar></ListItemAvatar> */}
              <ListItemText id={labelId} primary={`${value}`} />
              <ListItemSecondaryAction>
                {response[value] || "Unknown"}
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
