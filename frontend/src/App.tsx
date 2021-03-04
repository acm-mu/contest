import React, { useEffect, useState } from "react";

import { Footer } from "./components";
import "./App.scss";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Admin from "./pages/admin/";
import Blue from './pages/blue/';
import Gold from './pages/gold/'
import Index from './pages'
import { AppContext, AppContextType } from "./AppContext";
import config from './environment'
import io from 'socket.io-client';

const App = (): JSX.Element => {

  const [user, setUser] = useState()
  const [settings, setSettings] = useState()
  const [loaded, setLoaded] = useState(false)

  const checkAuth = async () => {
    const res = await fetch(`${config.API_URL}/auth`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
    const user = await res.json()
    setUser(user)
    setLoaded(true)
  }

  const loadSettings = async () => {
    const response = await fetch(`${config.API_URL}/contest`)
    const data = await response.json()

    setSettings({
      ...data,
      start_date: new Date(parseInt(data.start_date) * 1000),
      end_date: new Date(parseInt(data.end_date) * 1000)
    })
  }

  useEffect(() => {
    checkAuth()
    loadSettings()
  }, [])

  const appContext: AppContextType = {
    user,
    setUser,
    socket: io(config.API_URL),
    loaded,
    settings
  }

  return (
    <AppContext.Provider value={appContext} >
      <Router>
        <Switch>
          <Route path='/admin' component={Admin} />
          <Route path="/blue" component={Blue} />
          <Route path="/gold" component={Gold} />
          <Route path="/" component={Index} />
        </Switch>
      </Router>
      <Footer />
    </AppContext.Provider>
  )
}

export default App;
