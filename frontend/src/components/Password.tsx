import React, { ChangeEvent, useContext, useState } from "react";
import { useHistory } from "react-router";
import { Button, Form, Modal } from "semantic-ui-react";
import { AppContext } from "context";
import config from 'environment'
import { userHome } from "utils";
import { StatusMessage } from ".";

interface PasswordModalProps {
  trigger?: JSX.Element
  open?: boolean
}

const PasswordModal = ({ trigger, open }: PasswordModalProps): JSX.Element => {
  const { setUser } = useContext(AppContext)
  const history = useHistory()
  const [error, setError] = useState<string>()
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  const [isOpen, setOpen] = useState(open || false)
  const [isChanging, setChanging] = useState(false)
  const [isViewable, setViewable] = useState({ currentPassword: false, newPassword: false, newPasswordConfirm: false})

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [name]: value })
  const handleSubmit = async () => {
    try {
      setChanging(true)
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
        history.push(userHome(user))
      } else {
        const { message } = await response.json()
        setError(message)
      }
    } catch (err) {
      console.error(err)
    }
    setChanging(false)
    setFormData({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  }

  const changeFieldType = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    setViewable({ ...isViewable, [name]: value })
    try{
        console.log(name)
    }  catch (err) {
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
        {error ? <StatusMessage message={{ type: 'error', message: error }} /> : <></>}
        <Form className='attached fluid segment' id="passwordChangeForm" onSubmit={handleSubmit}>
          <Form.Input
            label="Current Password"
            type="password"
            required
            value={formData.currentPassword}
            icon={ isViewable ? {name:'eye', link: true, onClick: changeFieldType(currentPassword, false)} : { name: 'eye slash', link: true, onClick: changeFieldType('currentPassword')}}
            name="currentPassword"
            onChange={handleChange}
          />
          <Form.Input
            label="New Password"
            type="password"
            required
            value={formData.newPassword}
            icon={ isViewable ? {name:'eye', link: true, onClick: changeFieldType('newPassword')} : { name: 'eye slash', link: true, onClick: changeFieldType('newPassword')}}
            name="newPassword"
            onChange={handleChange}
          />
          <Form.Input
            label="Retype New Password"
            type="password"
            required
            value={formData.newPasswordConfirm}
            icon={ isViewable ? {name:'eye', link: true, onClick: changeFieldType('newPasswordConfirm')} : { name: 'eye slash', link: true, onClick: changeFieldType('newPasswordConfirm')}}
            name="newPasswordConfirm"
            onChange={handleChange}
          />
          <Button type="submit" primary loading={isChanging} disabled={isChanging}>Save</Button>
        </Form>
      </Modal.Description>
    </Modal>
  </>)
};

export default PasswordModal;
