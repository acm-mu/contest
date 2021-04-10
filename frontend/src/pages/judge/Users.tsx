import { User } from 'abacus'
import React, { useState, useEffect, useContext } from 'react'
import { Table } from 'semantic-ui-react'
import config from 'environment'
import { AppContext } from 'context'
import { Helmet } from 'react-helmet';
import { PageLoading, StatusMessage } from 'components';

type SortKey = 'uid' | 'display_name' | 'username' | 'role' | 'division' | 'school'
type SortConfig = {
  column: SortKey
  direction: 'ascending' | 'descending'
}

const Teams = (): JSX.Element => {
  const { user } = useContext(AppContext)

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const [isMounted, setMounted] = useState(true)
  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'username',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, users_list: User[] = users) => {
    const newDirection = column === newColumn && direction === 'ascending' ? 'descending' : 'ascending'
    setSortConfig({ column: newColumn, direction: newDirection })

    setUsers(users_list.sort((u1: User, u2: User) =>
      (u1[newColumn] || 'ZZ').localeCompare(u2[newColumn] || 'ZZ') * (direction == 'ascending' ? 1 : -1)
    ))
  }

  useEffect(() => {
    loadUsers()
    return () => { setMounted(false) }
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users?division=${user?.division}&role=team`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`
        }
      })
      if (isMounted) {
        const data = Object.values(await response.json()) as User[]
        sort('username', data)
        setLoading(false)
      }
    } catch (err) {
      setError(err)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <StatusMessage message={{ type: 'error', message: error }} />

  return <>
    <Helmet> <title>Abacus | Users</title> </Helmet>
    <Table sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            sorted={column === 'username' ? direction : undefined}
            onClick={() => sort('username')}
            content="Username" />
          <Table.HeaderCell
            sorted={column === 'display_name' ? direction : undefined}
            onClick={() => sort('display_name')}
            content="Display Name" />
          <Table.HeaderCell
            sorted={column === 'school' ? direction : undefined}
            onClick={() => sort('school')}
            content="School" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((team: User) =>
          <Table.Row key={team.uid} uuid={`${team.uid}`}>
            <Table.Cell>{team.username}</Table.Cell>
            <Table.Cell>{team.display_name}</Table.Cell>
            <Table.Cell>{team.school}</Table.Cell>
          </Table.Row>)}
      </Table.Body>
    </Table>
  </>
}

export default Teams