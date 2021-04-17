import React, { useState, useEffect, useContext } from 'react'
import { Table, Loader, Message, Icon } from 'semantic-ui-react'
import { Countdown, Block, DivisionLabel } from 'components';
import { Helmet } from 'react-helmet';
import { AppContext } from 'context';

type TeamType = {
  division: string,
  team_name: string,
  registration_date: string,
  school_name: string,
  num_of_students: number
}

const Home = (): JSX.Element => {

  const { settings } = useContext(AppContext)
  const [isLoading, setLoading] = useState(true)
  const [teams, setTeams] = useState<TeamType[]>([])
  const [isMounted, setMounted] = useState(true)

  const livestream = 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2M0ZGQzM2ItN2I2Ny00NjRkLWIyNGQtZTI5NTgzYzViY2Vm%40thread.v2/0?context=%7b%22Tid%22%3a%22abe32f68-c72d-420d-b5bd-750c63a268e4%22%2c%22Oid%22%3a%22d701d0b6-587c-40bc-9ea2-95f03b5383d8%22%2c%22IsBroadcastMeeting%22%3atrue%7d&btype=a&role=a'
  const welcome = 'https://youtu.be/dmqXTOhNQng'


  const loadTeams = () => {
    fetch('https://mu.acm.org/api/registered_teams')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setTeams(Object.values(data))
          setLoading(false)
        }
      })
  }

  useEffect(() => {
    loadTeams()
    const teamFetchInterval = setInterval(loadTeams, 5 * 60 * 1000);
    return () => {
      clearInterval(teamFetchInterval);
      setMounted(false);
    }
  })

  const isBeforeCompetition = () => !settings || (new Date() < settings.start_date && new Date() > settings.practice_start_date)
  const isAfterCompetition = () => !settings || new Date() > settings.end_date

  return (
    <>
      <Helmet> <title>Abacus</title> </Helmet>
      {isBeforeCompetition() ?
        <Message icon color='blue'>
          <Icon name='youtube' />
          <Message.Content>
            <Message.Header>Teams!</Message.Header>
          Watch our welcome video! Click <b><a href={welcome} target="_blank" rel="noreferrer">here</a></b> to view it on YouTube.
          </Message.Content>
        </Message> : isAfterCompetition() ?
          <Message icon color='blue'>
            <Icon name='video' />
            <Message.Content>
              <Message.Header>Teams!</Message.Header>
                Join us for the awards and closing ceremony at <b>1:00 PM</b>! Click <b><a href={livestream} target="_blank" rel="noreferrer">here</a></b> to join the event on Microsoft Teams.
              </Message.Content>
          </Message> :
          <></>
      }
      <Countdown />
      <Block size='xs-12'>
        <h1>Welcome to Abacus</h1>
        <p>Abacus is a remote code execution application similar to AlgoExpert. It is developed by students at Marquette University.</p>
      </Block >
      <Block size='xs-12'>
        <h1>Teams</h1>
        <p>Take a look at our teams this year! Don&apos;t see your team? <a href="mailto:acm-registration@mscs.mu.edu">Let us know!</a></p>
        {isLoading ?
          <Loader active inline='centered' content="Loading..." /> :
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Team Name</Table.HeaderCell>
                <Table.HeaderCell>Division</Table.HeaderCell>
                <Table.HeaderCell>School</Table.HeaderCell>
                <Table.HeaderCell># of Students</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {teams.sort(
                (t1: TeamType, t2: TeamType) => Date.parse(t2.registration_date) - Date.parse(t1.registration_date))
                .map((team: TeamType, index: number) => (
                  <Table.Row key={`${team.team_name}-${index}`}>
                    <Table.Cell>{team.team_name}</Table.Cell>
                    <Table.Cell>
                      <DivisionLabel division={team.division} />
                    </Table.Cell>
                    <Table.Cell>{team.school_name}</Table.Cell>
                    <Table.Cell>{team.num_of_students}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        }
      </Block>
    </>

  );

}

export default Home;