import { User } from 'abacus'
import React, { ChangeEvent, useState, useEffect, useContext } from 'react'
import { Table, Button, Label } from 'semantic-ui-react'
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom'
import config from 'environment'
import { AppContext } from 'context'
import CreateUser from './CreateUser'
import { Helmet } from 'react-helmet';
import { DivisionLabel, PageLoading, StatusMessage } from 'components';

interface UserItem extends User {
  checked: boolean
}
type SortKey = 'uid' | 'display_name' | 'username' | 'role' | 'division' | 'school'
type SortConfig = {
  column: SortKey
  direction: 'ascending' | 'descending'
}

const Users = (): JSX.Element => {
  const { user } = useContext(AppContext)

  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isDeleting, setDeleting] = useState(false)
  const [isImporting, setImporting] = useState(false)
  const [error, setError] = useState<string>()

  const [isMounted, setMounted] = useState(true)
  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'username',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, users_list: UserItem[] = users) => {
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
      const response = await fetch(`${config.API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`
        }
      })
      if (isMounted) {
        const data = Object.values(await response.json()) as UserItem[]
        sort('username', data.map(user => ({ ...user, checked: false })))
        setLoading(false)
      }
    } catch (err) {
      setError(err)
    }
  }

  const downloadUsers = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitized = JSON.stringify(users.map(({ checked, ...user }) => user), null, '\t')
    saveAs(new File([sanitized], 'users.json', { type: 'text/json;charset=utf-8' }))
  }

  const importUsers = async () => {
    setImporting(true)
    const passwords = []

    try {
      const response = await fetch('https://mu.acm.org/api/registered_teams')
      const teams = await response.json()

      let i = 1

      for (const team of teams) {
        if (team.division === 'eagle') continue
        const password = await (await fetch('https://www.passwordrandom.com/query?command=password&scheme=rrVNvNRRNN')).text()

        const username = 'team' + i

        const res = await fetch(`${config.API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.accessToken}`
          },
          body: JSON.stringify({
            division: team.division,
            display_name: team.team_name,
            school: team.school_name,
            password,
            role: 'team',
            username
          })
        })

        if (res.ok) {
          passwords.push({
            display_name: team.team_name,
            username,
            password
          })
          const new_user = await res.json()
          setUsers(users => users.concat(new_user))
        }
        i++
      }

      if (passwords.length != 0) {
        const sanitized = JSON.stringify(passwords, null, '\t')
        saveAs(new File([sanitized], 'imported_users.json', { type: 'text/json;charset=utf-8' }))
      }


    } catch (err) {
      console.log(err)
      setError(err)
    }
    setImporting(false)
  }

  const handleChange = ({ target: { id, checked } }: ChangeEvent<HTMLInputElement>) => setUsers(users.map(user => user.uid == id ? { ...user, checked } : user))
  const checkAll = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setUsers(users.map(user => ({ ...user, checked })))

  const createUserCallback = (response: Response) => {
    if (response.ok)
      loadUsers()
  }

  const deleteSelected = async () => {
    if (users.filter(u => u.checked && u.uid == user?.uid).length > 0) {
      alert("Cannot delete currently logged in user!")
      return
    }

    setDeleting(true)

    const usersToDelete = users.filter(user => user.checked).map(user => user.uid)
    const response = await fetch(`${config.API_URL}/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ uid: usersToDelete })
    })

    if (response.ok) {
      setUsers(users.filter(user => !usersToDelete.includes(user.uid)))
    }

    setDeleting(false)
  }

  if (isLoading) return <PageLoading />
  if (error) return <StatusMessage message={{ type: 'error', message: error }} />

  return <>
    <Helmet> <title>Abacus | Users</title> </Helmet>
    <CreateUser trigger={<Button content="Add User" primary />} callback={createUserCallback} />
    <Button as={Link} to={'/admin/users/upload'} content="Upload Users" />
    <Button loading={isImporting} disabled={isImporting} content="Import Users" onClick={importUsers} />
    <Button content="Download Users" onClick={downloadUsers} />
    {users.filter(user => user.checked).length ?
      <Button loading={isDeleting} disabled={isDeleting} content="Delete Selected" negative onClick={deleteSelected} /> : <></>}

    <Table sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell collapsing><input type='checkbox' onChange={checkAll} /></Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'username' ? direction : undefined}
            onClick={() => sort('username')}
            content="Username" />
          <Table.HeaderCell
            sorted={column === 'role' ? direction : undefined}
            onClick={() => sort('role')}
            content="Role" />
          <Table.HeaderCell
            sorted={column === 'division' ? direction : undefined}
            onClick={() => sort('division')}
            content="Division" />
          <Table.HeaderCell
            sorted={column === 'school' ? direction : undefined}
            onClick={() => sort('school')}
            content="School" />
          <Table.HeaderCell
            sorted={column === 'display_name' ? direction : undefined}
            onClick={() => sort('display_name')}
            content="Display Name" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user: UserItem) =>
          <Table.Row key={user.uid} uuid={`${user.uid}`}>
            <Table.Cell>
              <input
                type='checkbox'
                checked={user.checked}
                id={user.uid}
                onChange={handleChange} />
            </Table.Cell>
            <Table.Cell className='space-between'>
              <Link to={`/admin/users/${user.uid}`}>{user.username}</Link>
              {user.disabled && <Label color='red' content="Disabled" />}
            </Table.Cell>
            <Table.Cell>{user.role}</Table.Cell>
            <Table.Cell><DivisionLabel division={user.division} /></Table.Cell>
            <Table.Cell>{user.school}</Table.Cell>
            <Table.Cell>{user.display_name}</Table.Cell>
          </Table.Row>)}
      </Table.Body>
    </Table>
  </>
}

export default Users