import React from "react";

import { NavLink } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { Navigation } from "../../components";

const BlueNavigation = (): JSX.Element => (
  <Navigation>
    <Menu.Item as={NavLink} exact to="/blue">
      Home
    </Menu.Item>

    <Menu.Item as={NavLink} to="/blue/problems">
      Problems
    </Menu.Item>

    <Menu.Item as={NavLink} to="/blue/standings">
      Standings
    </Menu.Item>

    <Menu.Item as={NavLink} to="/blue/submissions">
      Submissions
    </Menu.Item>

    <Menu.Item as={NavLink} to="/blue/clarifications">
      Clarifications
    </Menu.Item>

  </Navigation>
);

export default BlueNavigation;