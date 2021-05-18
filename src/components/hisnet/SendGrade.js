import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Checkbox from "@material-ui/core/Checkbox";
import Avatar from "@material-ui/core/Avatar";
import axios from "axios";
import { url_config } from "../../url_config";
import { Button } from "@material-ui/core";

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
        setResponse((state) => ({ ...state, [value]: "Updating..." }));
        axios
          .post(`${url_config.hisnet_grade}/score`, {
            token,
            code: classInfo.code,
            ban: classInfo.ban,
            contentId: homeworkInfo.contentId,
            hakbuns,
            hakbun: value,
            point: studentInfo[value]
              ? +Number.parseFloat(
                  Object.values(studentInfo[value].points).reduce(
                    (prev, curr) => {
                      return prev + +(curr.point || 0);
                    },
                    0
                  ) * (studentInfo[value].late ? 1 - gradeInfo.late_deduct : 1)
                ).toFixed(2)
              : 0,
            content: studentInfo[value]
              ? Object.keys(studentInfo[value].points)
                  .filter(
                    (pointId) => studentInfo[value].points[pointId].deduct > 0
                  )
                  .sort((a, b) => +a.split("-")[1] - +b.split("-")[1])
                  .map(
                    (pointId) =>
                      `(-${studentInfo[value].points[pointId].deduct}) ${studentInfo[value].points[pointId].desc}`
                  )
                  .join("\n")
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
