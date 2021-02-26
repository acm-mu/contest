import React, { useState, useEffect, useContext } from 'react'
import { Countdown, Block } from "../components";
import { Table, Label } from 'semantic-ui-react'
import { TeamType } from '../types'
import { capitalize } from '../utils';

const Home = (): JSX.Element => {

  const [isLoading, setLoading] = useState<boolean>(true)
  const [teams, setTeams] = useState<TeamType[]>([])
  const [isMounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    loadTeams()
    return () => { setMounted(false) }
  }, [isMounted])

  const loadTeams = () => {
    fetch('https://mu.acm.org/api/registered_teams')
      .then(res => res.json())
      .then(data => {
        if (isMounted) { 
          setTeams(Object.values(data))
        }
      })
  }

  let color: string
  type LabelColor = "blue" | "yellow" | "teal" | "grey"
  
  const labelColor = (division: string): LabelColor => {
    switch(division) {
      case "blue":
        return "blue";
      case "gold":
        return "yellow";
      case "eagle":
        return "teal";
      default:
        return "grey";
    }
  }
return (
  <><Countdown />
    <Block size='xs-12'>
      <h1>Teams</h1>
      <p>Take a look at our teams this year! Don&apos;t see your team? <a href="mailto:acm-registration@mscs.mu.edu">Let us know!</a></p>
      
          {/* <Loader active inline='centered' content="Loading..." />  */}
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
                    <Label color={labelColor(team.division)}>
                      {capitalize(team.division)}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>{team.school_name}</Table.Cell>
                  <Table.Cell>{team.num_of_students}</Table.Cell>
                </Table.Row>
                ))}
            </Table.Body>
          </Table>
        
      </Block>
  </>

);

}

export default Home;
