import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Grade from "./pages/Grade";
import { CssBaseline, Paper } from "@material-ui/core";
import GradeNew from "./pages/GradeNew";
import { userStore } from "./stores/userStore";
import { useContext } from "react";
import NoLogin from "./pages/NoLogin";

function App() {
  const { currentUser, loading } = useContext(userStore).state;

  if (!currentUser) return <NoLogin />;
  // if (loading) return <div>Loading</div>;

  return (
    <div className="App">
      <CssBaseline />
      <Paper>
        <Router>
          <Switch>
            <Route path="/grade/add" component={GradeNew} />
            <Route path="/grade/:gradeID" component={Grade} />
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </Paper>
    </div>
  );
}

export default App;
