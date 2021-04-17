import React from "react";
import { Container } from "semantic-ui-react";
import { Switch, Route } from "react-router-dom";
import { NotFound } from "components";
import EagleNavigation from "./EagleNavigation";
import Home from "./Home";
import Problem from "./Problem";
import Clarifications from "../Clarifications";

const Eagle = (): JSX.Element => (
  <>
    <EagleNavigation />
    <Container text className="main">
      <Switch>
        <Route exact path='/eagle/' component={Home} />
        <Route path='/eagle/problem' component={Problem} />
        <Route path='/eagle/clarifications/:cid' component={Clarifications} />
        <Route path='/eagle/clarifications' component={Clarifications} />
        <Route component={NotFound} />
      </Switch>
    </Container>
  </>
);

export default Eagle;
