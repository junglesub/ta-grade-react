import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
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

export default function GetStudents({
  token,
  classInfo,
  homeworkInfo,
  hakbuns,
  setHakbuns,
  selectedStudent,
  setSelectedStudent,
}) {
  const classes = useStyles();

  useEffect(() => {
    (async () => {
      setHakbuns(null);
      const students = (
        await axios.post(`${url_config.hisnet_grade}/students`, {
          token,
          code: classInfo.code,
          ban: classInfo.ban,
          contentId: homeworkInfo.contentId,
        })
      ).data;
      setHakbuns(students);
      console.log(students);
    })();
  }, [token, classInfo.code, classInfo.ban, homeworkInfo, setHakbuns]);

  const handleToggle = (value) => () => {
    const currentIndex = selectedStudent.indexOf(value);
    const newSelectedStudent = [...selectedStudent];

    if (currentIndex === -1) {
      newSelectedStudent.push(value);
    } else {
      newSelectedStudent.splice(currentIndex, 1);
    }

    setSelectedStudent(newSelectedStudent);
  };

  const selectAll = () => setSelectedStudent([...hakbuns.hakbuns]);
  const selectNone = () => setSelectedStudent([]);

  return hakbuns === null ? (
    <p>Loading...</p>
  ) : !hakbuns ? (
    <p>Unknown Error</p>
  ) : (
    <div>
      <Button onClick={selectAll}>Select All</Button>
      <Button onClick={selectNone}>Select None</Button>
      <List dense className={classes.root}>
        {[...hakbuns.hakbuns].map((value) => {
          const labelId = `checkbox-list-secondary-label-${value}`;
          return (
            <ListItem key={value} button>
              {/* <ListItemAvatar></ListItemAvatar> */}
              <ListItemText id={labelId} primary={`${value}`} />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={handleToggle(value)}
                  checked={selectedStudent.indexOf(value) !== -1}
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
