import React, { useState } from "react"
import { Modal, Form, Input, Select, Button, Message } from "semantic-ui-react"
import config from '../../environment'

type CreateUserProps = {
  trigger: JSX.Element
}

const CreateUser = ({ trigger }: CreateUserProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const [user, setUser] = useState({
    username: '',
    role: '',
    division: '',
    display_name: '',
    password: ''
  })

  const roles = [
    { key: 'team', text: 'Team', value: 'team' },
    { key: 'judge', text: 'Judge', value: 'judge' },
    { key: 'admin', text: 'Admin', value: 'admin' }
  ]
  const divisions = [
    { key: 'blue', text: 'Blue', value: 'blue' },
    { key: 'gold', text: 'Gold', value: 'gold' },
    { key: 'na', text: 'N/A', value: 'na' }
  ]

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setUser({ ...user, [name]: value })
  }

  const handleSelectChange = (_: never, result: HTMLInputElement) => {
    const { name, value } = result
    setUser({ ...user, [name]: value })
  }

  const handleSubmit = async () => {
    const res = await fetch(`${config.API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    if (res.status == 200) {
      setOpen(false)
    } else if (res.status == 400) {
      const body = await res.json()
      setError(body.message)
    }
  }

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={trigger}
    >
      <Modal.Header>Create User</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {error && <Message error>{error}</Message>}
          <Form>
            <Form.Field
              control={Input}
              onChange={handleChange}
              label='Username'
              name='username'
              value={user.username}
              placeholder='User Name'
              required
            />
            <Form.Field
              control={Select}
              onChange={handleSelectChange}
              label='User Role'
              name='role'
              options={roles}
              value={user.role}
              placeholder='User Role'
              required
            />
            <Form.Field
              control={Select}
              onChange={handleSelectChange}
              label='Division'
              name='division'
              options={divisions}
              value={user.division}
              placeholder='Division'
              required />
            <Form.Field
              control={Input}
              onChange={handleChange}
              label='Display Name'
              name='display_name'
              value={user.display_name}
              placeholder='Display Name'
              required
            />
            <Form.Field
              control={Input}
              onChange={handleChange}
              name='password'
              label='Password'
              value={user.password}
              type='password'
              placeholder='Password'
              required
            />
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => { setOpen(false) }}>Cancel</Button>
        <Button positive onClick={handleSubmit}>Create</Button>
      </Modal.Actions>
    </Modal>
  )
}

export default CreateUser