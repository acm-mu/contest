import React from "react";
import { Container } from "semantic-ui-react";
import { Switch, Route } from "react-router-dom";
import { NotFound } from "components";
import JudgeNavigation from "./JudgeNavigation";
import Home from "./Home";
import Teams from './Users';
import Problems from './Problems'
import Problem from "./Problem";
import Submission from "./Submission";
import Submissions from "./Submissions";
import Clarifications from "../Clarifications";

const Judge = (): JSX.Element => (
  <>
    <JudgeNavigation />
    <Container text className="main">
      <Switch>
        <Route exact path='/judge/' component={Home} />
        <Route path='/judge/teams' component={Teams} />
        <Route path='/judge/problems/:pid' component={Problem} />
        <Route path='/judge/problems' component={Problems} />
        <Route path='/judge/submissions/:sid' component={Submission} />
        <Route path='/judge/submissions' component={Submissions} />
        <Route path='/judge/clarifications/:cid' component={Clarifications} />
        <Route path='/judge/clarifications' component={Clarifications} />
        <Route component={NotFound} />
      </Switch>
    </Container>
  </>
);

export default Judge;
