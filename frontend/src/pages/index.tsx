import React from 'react';
import { Container } from 'semantic-ui-react';
import { Route, Switch } from 'react-router-dom';

import Home from './Home';
import About from './About';
import Help from './Help';
import DefaultNavigation from './DefaultNavigation';
import { NotFound } from 'components';
import Clarifications from './Clarifications';

export const Index = (): JSX.Element => (
  <>
    <DefaultNavigation />
    <Container text className="main">
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/help" component={Help} />
        <Route path='/clarifications/:cid' component={Clarifications} />
        <Route path='/clarifications' component={Clarifications} />
        <Route component={NotFound} />
      </Switch>
    </Container>
  </>
);

export { default as Gold } from './gold'
export { default as Blue } from './blue'
export { default as Eagle } from './eagle'
export { default as Admin } from './admin'
export { default as Judge } from './judge'
export { default as Proctor } from './proctor'
