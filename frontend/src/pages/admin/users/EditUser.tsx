import { User } from "abacus"
import React, { ChangeEvent, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Button, Checkbox, CheckboxProps, Form, Input, Label, Menu, Select } from "semantic-ui-react"
import config from 'environment'
import { Block, NotFound, PageLoading } from "components"
import { divisions, roles } from "utils"
import { Helmet } from "react-helmet"
import StatusMessage, { StatusMessageType } from "components/StatusMessage"

const EditUser = (): JSX.Element => {
  const [user, setUser] = useState<User>()
  const [formUser, setFormUser] = useState<User>({
    uid: '',
    username: '',
    role: '',
    division: '',
    school: '',
    display_name: '',
    password: ''
  })
  const [isLoading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [message, setMessage] = useState<StatusMessageType>()
  const { uid } = useParams<{ uid: string }>()

  const history = useHistory()

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => setFormUser({ ...formUser, [name]: value })
  const handleSelectChange = (_: never, { name, value }: HTMLInputElement) => setFormUser({ ...formUser, [name]: value })
  const handleCheckboxChange = async (_event: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setSaving(true)
    const response = await fetch(`${config.API_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ uid, disabled: checked })
    })

    if (response.ok) {
      await loadUser()
    } else {
      setFormUser({ ...formUser, disabled: !checked })
    }

    setSaving(false)
  }

  const handleSubmit = async () => {
    setSaving(true)
    const response = await fetch(`${config.API_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ ...formUser, school: formUser.role == 'team' ? formUser.school : '', })
    })
    if (response.ok) {
      const body = await response.json()
      setMessage({ type: 'success', message: "User saved successfully!" })
      setUser(body)
      setFormUser({ ...body, password: '' })
    } else {
      const body = await response.json()
      setMessage({ type: 'error', message: body.message })
    }
    setSaving(false)
  }

  const loadUser = async () => {
    const response = await fetch(`${config.API_URL}/users?uid=${uid}`, {
      headers: {
        authorization: `Bearer ${localStorage.accessToken}`
      }
    })
    if (!isMounted) return

    const users: User[] = Object.values(await response.json())
    if (users.length > 0) {
      setUser(users[0])
      setFormUser({ ...users[0], password: '' })
    }

    setLoading(false)
  }

  useEffect(() => {
    loadUser()
    return () => { setMounted(false) }
  }, [])

  if (isLoading) return <PageLoading />
  if (!user) return <NotFound />

  return <>
    <Helmet> <title>Abacus | Edit User</title> </Helmet>
    <h1 className='justify-center'>
      {user.display_name}
      {user.disabled && <Label color='red'>Disabled</Label>}
    </h1>
    <StatusMessage message={message} onDismiss={() => setMessage(undefined)} />
    <Menu attached='top' tabular>
      <Menu.Item active>User Info</Menu.Item>
    </Menu>
    <Block size='xs-12' menuAttached="top">
      <Form onSubmit={handleSubmit}>
        <div className='justify-center' style={{ justifyContent: 'space-between' }}>
          <h2>Edit User</h2>

          <Checkbox
            label='Disabled'
            name='disabled'
            checked={formUser?.disabled}
            onChange={handleCheckboxChange}
            toggle />
        </div>
        <Form.Field
          control={Input}
          onChange={handleChange}
          label='Username'
          name='username'
          value={formUser?.username}
          placeholder='User Name'
          required />
        <Form.Field
          control={Input}
          onChange={handleChange}
          label='Display Name'
          name='display_name'
          value={formUser?.display_name}
          placeholder='Display Name'
          required />
        <Form.Field
          control={Select}
          onChange={handleSelectChange}
          label='User Role'
          name='role'
          options={roles}
          value={formUser?.role}
          placeholder='User Role'
          required />
        {formUser.role == 'team' &&
          <Form.Field
            control={Input}
            onChange={handleChange}
            label='School'
            name='school'
            value={formUser?.school}
            placeholder='School'
            required />}
        {['team', 'judge'].includes(user.role) && <Form.Field
          control={Select}
          onChange={handleSelectChange}
          label='Division'
          name='division'
          options={divisions}
          value={formUser?.division}
          placeholder='Division'
          required />}
        <Form.Field
          control={Input}
          onChange={handleChange}
          label='Password'
          name='password'
          type='password'
          value={formUser?.password}
          placeholder='Password'
          required />
        <Button floated='right' onClick={history.goBack}>Cancel</Button>
        <Button floated='right' primary type="submit" loading={isSaving} disabled={isSaving}>Save</Button>
      </Form>
    </Block>
  </>
}

export default EditUser