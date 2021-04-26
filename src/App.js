import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Grade from "./components/Grade";
import { CssBaseline, Paper } from "@material-ui/core";
import GradeNew from "./pages/GradeNew";

function App() {
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
