import { Problem, StandingsUser } from "abacus";
import React, { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import { Table } from "semantic-ui-react";
import { Block, Countdown, PageLoading, StatusMessage } from "components";
import config from 'environment'
import "../Standings.scss";
import { AppContext, SocketContext } from "context";
import { Helmet } from "react-helmet";

const Standings = (): JSX.Element => {
  const { user, settings } = useContext(AppContext);
  const socket = useContext(SocketContext)
  const [problems, setProblems] = useState<Problem[]>();
  const [standings, setStandings] = useState<StandingsUser[]>();
  const [isLoading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(true)

  const helmet = <Helmet> <title>Abacus | Blue Standings</title> </Helmet>

  const loadData = async () => {
    const response = await fetch(`${config.API_URL}/standings?division=blue`)

    const data = await response.json()

    if (!isMounted) return

    setStandings(data.standings)

    if (data.problems) {
      const problems = Object.values(data.problems) as Problem[]
      setProblems(problems.sort((p1, p2) => p1.id.localeCompare(p2.id)))
    }

    setLoading(false)
  }

  socket?.on('new_submission', loadData)

  useEffect(() => {
    loadData()
    return () => { setMounted(false) }
  }, []);

  if (!settings || new Date() < settings.practice_start_date)
    return <>
      {helmet}
      <Countdown />
      <Block size='xs-12'>
        <h1>Competition not yet started!</h1>
        <p>Standings will become available when the competition begins, and submissions start rolling in.</p>
      </Block>
    </>


  if (isLoading) return <PageLoading />

  if (!standings || !problems)
    return <>
      {helmet}
      <StatusMessage message={{ type: 'error', message: "An error has occurred! Please contact support" }} />
    </>

  return <>
    {helmet}
    <Countdown />
    <Block size="xs-12" transparent>
      <div className="table-legend">
        <div>
          <span className="legend-solved legend-status"></span>
          <p className="legend-label">Full score</p>
        </div>
        <div>
          <span className="legend-attempted legend-status"></span>
          <p className="legend-label">Attempted problem</p>
        </div>
        <div>
          <span className="legend-pending legend-status"></span>
          <p className="legend-label">Pending judgement</p>
        </div>
      </div>
    </Block>

    <Block transparent size='xs-12'>
      <Table celled id={"standings"}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell collapsing>RK</Table.HeaderCell>
            <Table.HeaderCell>Team</Table.HeaderCell>
            <Table.HeaderCell collapsing>SLV.</Table.HeaderCell>
            <Table.HeaderCell collapsing>TIME</Table.HeaderCell>
            {problems.map(problem =>
              <Table.HeaderCell key={problem.id} collapsing>
                {user?.division === 'blue' || user?.role === 'admin' ?
                  <Link to={`/blue/problems/${problem.id}`}>{problem.id}</Link> :
                  problem.id
                }
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {standings.map((team, index) => (
            <Table.Row key={team.uid} warning={team.uid == user?.uid} style={{ fontWeight: team.uid == user?.uid ? 'bold' : 'normal' }}>
              <Table.Cell collapsing>{index + 1}</Table.Cell>
              <Table.Cell>{team.display_name}</Table.Cell>
              <Table.Cell>{team.solved}</Table.Cell>
              <Table.Cell>{team.time}</Table.Cell>
              {Object.values(team.problems).map(
                (problem, index) => {
                  if (problem.solved) {
                    return (
                      <Table.Cell key={`${team.uid}-${index}`} className="solved">
                        {problem.submissions.length}
                        <br />
                        <small>{problem.problem_score}</small>
                      </Table.Cell>
                    );
                  } else if (problem.submissions.length && problem.submissions[problem.submissions.length - 1].status == "pending") {
                    return (
                      <Table.Cell key={`${team.uid}-${index}`} className="pending">
                        {problem.submissions.length}
                        <br />
                        <small>--</small>
                      </Table.Cell>
                    );
                  } else if (problem.submissions.length) {
                    return (
                      <Table.Cell key={`${team.uid}-${index}`} className="attempted">
                        {problem.submissions.length}
                        <br />
                        <small>--</small>
                      </Table.Cell>
                    );
                  } else {
                    return <Table.Cell key={`${team.uid}-${index}`}></Table.Cell>;
                  }
                }
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Block>
  </>
};

export default Standings;
