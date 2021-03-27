import { User } from 'abacus';
import { createHash } from 'crypto';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Label, Table } from 'semantic-ui-react';
import { Block, FileDialog } from 'components';
import config from "environment"
import { Helmet } from 'react-helmet';

interface UserItem extends User {
  checked: boolean
}

const UploadUsers = (): JSX.Element => {
  const history = useHistory()
  const [file, setFile] = useState<File>()
  const [users, setUsers] = useState<{ [key: string]: User }>()
  const [newUsers, setNewUsers] = useState<UserItem[]>()

  const uploadChange = ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
    if (files?.length) {
      const reader = new FileReader();
      reader.onload = async ({ target }: ProgressEvent<FileReader>) => {
        const text = target?.result as string
        if (text)
          setNewUsers(JSON.parse(text).map((user: User) => ({ ...user, checked: true })))
      }
      reader.readAsText(files[0])
      setFile(files[0])
    }
  }

  useEffect(() => {
    fetch(`${config.API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })
      .then(res => res.json())
      .then(res => setUsers(res))
  }, [])

  const filterUser = (u1: UserItem, u2: User) => {
    if (!u2) return true
    const { ...user1 } = u1
    const { ...user2 } = u2
    user1.password = createHash('sha256').update(user1.password).digest('hex')
    return JSON.stringify(user1, Object.keys(user1).sort()) !== JSON.stringify(user2, Object.keys(user2).sort())
  }

  const handleChange = ({ target: { checked, id } }: ChangeEvent<HTMLInputElement>) => setNewUsers(newUsers?.map(user => user.uid == id ? { ...user, checked } : user))
  const checkAll = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setNewUsers(newUsers?.map(user => ({ ...user, checked })))

  const handleSubmit = async () => {
    if (newUsers) {
      for (const user of newUsers.filter(u => u.checked)) {
        const response = await fetch(`${config.API_URL}/users`, {
          method: 'PUT',
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
    <Helmet>
      <title>Abacus |  Admin Upload Users</title>
    </Helmet>
    <Block size='xs-12' transparent>
      <h1>Upload Users</h1>

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
      {newUsers ? <>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing>
                <input type="checkbox" onChange={checkAll} />
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
            {newUsers.filter(user => users ? filterUser(user, users[user.uid]) : true)
              .map((user: UserItem, index: number) => (
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
                    {Object.keys(users || {}).includes(user.uid) ?
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
      </> : <></>}
    </Block>
  </>
}

export default UploadUsers