import React from "react";
import { Container } from "semantic-ui-react";
import { Switch, Route } from "react-router-dom";
import GoldNavigation from "./GoldNavigation";
import Home from "./Home";
import Connect from "./Connect";
import Problems from './Problems'
import Submit from './Submit'
import Problem from "./Problem";
import SubmitProblem from "./SubmitProblem";
import Submission from "./Submission";
import Submissions from "./Submissions";
import { NotFound } from "../../components";

const Gold = (): JSX.Element => (
  <>
    <GoldNavigation />
    <Container text className="main">
      <Switch>
        <Route exact path='/gold/' component={Home} />
        <Route path='/gold/connect' component={Connect} />
        <Route path='/gold/submit' component={Submit} />
        <Route path='/gold/problems' component={Problems} />
        <Route path='/gold/problems/:pid' component={Problem} />
        <Route path='/gold/problems/:pid/submit' component={SubmitProblem} />
        <Route path='/gold/submissions' component={Submissions} />
        <Route path='/gold/submissions/:sid' component={Submission} />
        <Route component={NotFound} />
      </Switch>
    </Container>
  </>
);

export default Gold;
