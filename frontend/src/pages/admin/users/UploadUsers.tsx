import { User } from 'abacus';
import { createHash } from 'crypto';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Label, Message, Table } from 'semantic-ui-react';
import { Block, FileDialog } from 'components';
import config from "environment"
import { Helmet } from 'react-helmet';

interface UserItem extends User {
  checked: boolean
}

const UploadUsers = (): JSX.Element => {
  const history = useHistory()
  const [file, setFile] = useState<File>()
  const [existingUsers, setExistingUsers] = useState<{ [key: string]: User }>()
  const [newUsers, setNewUsers] = useState<UserItem[]>()
  const [isMounted, setMounted] = useState(true)

  const uploadChange = ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
    if (!files?.length) return

    const reader = new FileReader();

    reader.onload = async ({ target }: ProgressEvent<FileReader>) => {
      const text = target?.result as string
      if (text) {
        let users: UserItem[] = JSON.parse(text).map((user: User) => ({ ...user, checked: true }))

        if (existingUsers) users = users.filter((user: UserItem) => filterUser(user, existingUsers[user.uid]))

        setNewUsers(users)
      }
    }

    reader.readAsText(files[0])
    setFile(files[0])
  }

  const loadExistingUsers = async () => {
    const response = await fetch(`${config.API_URL}/users`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })

    if (!response.ok || !isMounted) return

    setExistingUsers(await response.json())
  }

  useEffect(() => {
    loadExistingUsers()

    return () => setMounted(false)
  }, [])

  const filterUser = (u1: UserItem, u2: User) => {
    if (!u2) return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { checked, ...user1 } = u1
    const { ...user2 } = u2
    if (user1.password) user1.password = createHash('sha256').update(user1.password).digest('hex')

    return JSON.stringify(user1, Object.keys(user1).sort()) !== JSON.stringify(user2, Object.keys(user2).sort())
  }

  const handleChange = ({ target: { checked, id } }: ChangeEvent<HTMLInputElement>) => setNewUsers(newUsers?.map(user => user.uid == id ? { ...user, checked } : user))
  const checkAll = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setNewUsers(newUsers?.map(user => ({ ...user, checked })))

  const handleSubmit = async () => {
    if (newUsers) {
      for (const user of newUsers.filter(u => u.checked)) {
        const response = await fetch(`${config.API_URL}/users`, {
          method: Object.keys(existingUsers || {}).includes(user.uid) ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.accessToken}`
          },
          body: JSON.stringify(user)
        })
        if (response.ok) {
          history.push("/admin/users")
        }
      }
    }
  }

  return <>
    <Helmet> <title>Abacus |  Admin Upload Users</title> </Helmet>
    <Block size='xs-12' transparent>
      <h1>Upload Users</h1>
      <Block transparent size='xs-12'>
        <Button content='Back' icon='arrow left' labelPosition='left' onClick={history.goBack} />
      </Block>

      <FileDialog file={file} onChange={uploadChange} control={(file?: File) => (
        file ?
          <>
            <h3>Your upload will include the following files:</h3>
            <ul>
              <li>{file.name} ({file.size} bytes)</li>
            </ul>
          </> : <p>
            <b>Drag & drop</b> a file here to upload <br />
            <i>(Or click and choose file)</i>
          </p>
      )} />
      {newUsers?.length ? <>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing>
                <input type="checkbox" onChange={checkAll} checked={newUsers.length > 0 && newUsers.filter(user => !user.checked).length == 0} />
              </Table.HeaderCell>
              <Table.HeaderCell>User Id</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Division</Table.HeaderCell>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Password</Table.HeaderCell>
              <Table.HeaderCell>DisplayName</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {newUsers.map((user, index) => (
              <Table.Row key={index}>
                <Table.HeaderCell collapsing>
                  <input
                    type="checkbox"
                    checked={user.checked}
                    id={user.uid}
                    onChange={handleChange} />
                </Table.HeaderCell>
                <Table.Cell>
                  {user.uid}
                  {Object.keys(existingUsers || {}).includes(user.uid) ?
                    <Label color='blue' style={{ float: 'right' }}>Update User</Label> :
                    <Label color='green' style={{ float: 'right' }}>Brand New</Label>}
                </Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>{user.division}</Table.Cell>
                <Table.Cell>{user.username}</Table.Cell>
                <Table.Cell>{user.password}</Table.Cell>
                <Table.Cell>{user.display_name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Button primary onClick={handleSubmit}>Import user(s)</Button>
      </> : newUsers ? <Message warning icon='warning sign' content="The file contains no new or modified user(s)." /> : <></>}
    </Block>
  </>
}

export default UploadUsers