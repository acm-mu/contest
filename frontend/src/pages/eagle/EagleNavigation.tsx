import React, { useContext } from "react";
import { Menu } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { Navigation } from "components";
import { AppContext } from "context";

const EagleNavigation = (): JSX.Element => {
  const { user } = useContext(AppContext)
  const hasAccessTo = () => user?.role == 'admin' || user?.division == 'eagle'

  return (
    <Navigation className="eagle-div">
      <Menu.Item as={NavLink} exact to="/eagle" content="Home" />
      {hasAccessTo() ? <Menu.Item as={NavLink} to="/eagle/problem" content="Problem" /> : <></>}
      {hasAccessTo() ? <Menu.Item as={NavLink} to="/eagle/clarifications" content="Clarifications" /> : <></>}
    </Navigation>
  )
}

export default EagleNavigation;
