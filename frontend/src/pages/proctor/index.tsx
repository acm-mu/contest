import React from "react";
import { Container } from "semantic-ui-react";
import { Switch, Route } from "react-router-dom";
import { NotFound } from "components";
import ProctorNavigation from "./ProctorNavigation";
import Home from "./Home";
import Problems from './Problems'
import Problem from "./Problem";
import Submission from "./Submission";
import Submissions from "./Submissions";

const Proctor = (): JSX.Element => (
  <>
    <ProctorNavigation />
    <Container text className="main">
      <Switch>
        <Route exact path='/proctor/' component={Home} />
        <Route path='/proctor/problems/:pid' component={Problem} />
        <Route path='/proctor/problems' component={Problems} />
        <Route path='/proctor/submissions/:sid' component={Submission} />
        <Route path='/proctor/submissions' component={Submissions} />
        <Route component={NotFound} />
      </Switch>
    </Container>
  </>
);

export default Proctor;
