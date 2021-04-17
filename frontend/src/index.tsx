import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { IAmATeapot } from 'components/eastereggs/IAmATeapot';
import 'semantic-ui-css/semantic.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  // <React.StrictMode> Disable StrictMode because components from semantic-ui-react do not comply and throw errors
  <BrowserRouter>
    <Switch>
      <Route path='/coffee' component={IAmATeapot} />
      <Route component={App} />
    </Switch>
  </BrowserRouter>,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
