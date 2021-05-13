import "./App.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import Grade from "./pages/Grade";
import { CssBaseline, Paper } from "@material-ui/core";
import GradeNew from "./pages/GradeNew";
import { userStore } from "./stores/userStore";
import { useContext } from "react";
import NoLogin from "./pages/NoLogin";
import GradeView from "./pages/GradeView";
import GradeDownload from "./pages/GradeDownload";
import GradeButtons from "./components/GradeButtons";
import StudentView from "./pages/StudentView";
import GradeHome from "./pages/GradeHome";
import ExportToHisnet from "./pages/ExportToHisnet";

function App() {
  const { currentUser } = useContext(userStore).state;

  if (!currentUser) return <NoLogin />;
  // if (loading) return <div>Loading</div>;

  return (
    <div className="App">
      <CssBaseline />
      <Paper>
        <Router>
          <Route path="/grade/:gradeID" component={GradeButtons} />
          <Switch>
            <Route exact path="/grade/add" component={GradeNew} />
            <Route exact path="/grade" component={GradeHome} />
            <Route exact path="/grade/:gradeID/stu" component={StudentView} />
            <Route
              exact
              path="/grade/:gradeID/download"
              component={GradeDownload}
            />
            <Route exact path="/grade/:gradeID/view" component={GradeView} />
            <Route
              exact
              path="/grade/:gradeID/hisnet"
              component={ExportToHisnet}
            />
            <Route exact path="/grade/:gradeID" component={Grade} />
            <Route exact path="/" component={Home} />
          </Switch>
        </Router>
      </Paper>
    </div>
  );
}

export default App;
