import React, { useContext, useState } from "react";
import { Button, Form, Message, Modal } from "semantic-ui-react";
import AppContext from "../AppContext";
import fulllogo from '../assets/fulllogo.png'
import config from '../environment'

interface LoginModalProps {
  trigger?: JSX.Element
  open?: boolean
}

const LoginModal = ({ trigger, open }: LoginModalProps): JSX.Element => {
  const { setUser } = useContext(AppContext)
  const [error, setError] = useState<string>()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [isOpen, setOpen] = useState(open || false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      if (response.status == 200) {
        const { accessToken, ...user } = await response.json()
        localStorage.setItem('accessToken', accessToken)
        setUser(user)
      } else {
        const { message } = await response.json()
        setError(message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (<>
    <Modal size='tiny'
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={isOpen}
      trigger={trigger}>
      <Modal.Description>
        {error && <Message icon='warning circle' error attached='top' header="An error has occurred!" content={error} />}
        <Form className='attached fluid segment' id="loginForm" onSubmit={handleSubmit}>
          <img src={fulllogo} width="300px" alt="Logo" />
          <Form.Input
            label="Username"
            type="text"
            required
            value={formData.username}
            name="username"
            onChange={handleChange}
          />
          <Form.Input
            label="Password"
            type="password"
            required
            value={formData.password}
            name="password"
            onChange={handleChange}
          />
          <Button type="submit" primary>Login</Button>
        </Form>
      </Modal.Description>
    </Modal>
  </>)
};

export default LoginModal;