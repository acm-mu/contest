import React, { ChangeEvent, useEffect, useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'
import { Block, PageLoading, StatusMessage } from 'components'
import config from 'environment'
import { Helmet } from 'react-helmet'
import { StatusMessageType } from 'components/StatusMessage'

const timezoneOffset = () => (new Date()).getTimezoneOffset() * 60 * 1000

const toLocal = (date: number): Date => new Date((date * 1000) - timezoneOffset())

const toLocalDateString = (date: number): string => toLocal(date).toISOString().substring(0, 10)
const toLocalTimeString = (date: number): string => toLocal(date).toISOString().substring(11, 16)

const Settings = (): JSX.Element => {
  const [settings, setSettings] = useState<{ [key: string]: string }>({
    competition_name: '',
    practice_name: '',
    start_date: `${Date.now()}`,
    start_time: `${Date.now()}`,
    end_date: `${Date.now()}`,
    end_time: `${Date.now()}`,
    practice_start_date: `${Date.now()}`,
    practice_start_time: `${Date.now()}`,
    practice_end_date: `${Date.now()}`,
    practice_end_time: `${Date.now()}`,
    points_per_yes: '0',
    points_per_no: '0',
    points_per_compilation_error: '0',
    points_per_minute: '0'
  })
  const [isMounted, setMounted] = useState(true)
  const [isLoading, setLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [message, setMessage] = useState<StatusMessageType>()

  useEffect(() => {
    loadSettings()
    return () => { setMounted(false) }
  }, [])

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [name]: value })

  const loadSettings = async () => {
    const response = await fetch(`${config.API_URL}/contest`)
    const data = await response.json()
    if (!isMounted) return

    setSettings({
      ...data,
      start_date: toLocalDateString(data.start_date),
      start_time: toLocalTimeString(data.start_date),
      end_date: toLocalDateString(data.end_date),
      end_time: toLocalTimeString(data.end_date),

      practice_start_date: toLocalDateString(data.practice_start_date),
      practice_start_time: toLocalTimeString(data.practice_start_date),
      practice_end_date: toLocalDateString(data.practice_end_date),
      practice_end_time: toLocalTimeString(data.practice_end_date)
    })

    setLoading(false)
  }

  const handleSubmit = async () => {
    setSaving(true)
    const formData = new FormData()
    formData.set('competition_name', settings.competition_name)
    formData.set('practice_name', settings.practice_name)
    formData.set('points_per_yes', settings.points_per_yes)
    formData.set('points_per_no', settings.points_per_no)
    formData.set('points_per_compilation_error', settings.points_per_compilation_error)
    formData.set('points_per_minute', settings.points_per_minute)
    formData.set('start_date', `${Date.parse(`${settings.start_date} ${settings.start_time}`) / 1000.0}`)
    formData.set('end_date', `${Date.parse(`${settings.end_date} ${settings.end_time}`) / 1000.0}`)
    formData.set('practice_start_date', `${Date.parse(`${settings.practice_start_date} ${settings.practice_start_time}`) / 1000.0}`)
    formData.set('practice_end_date', `${Date.parse(`${settings.practice_end_date} ${settings.practice_end_time}`) / 1000.0}`)

    const response = await fetch(`${config.API_URL}/contest`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: formData
    })

    if (response.ok) {
      setMessage({ type: 'success', message: "Settings saved successfully!" })
    } else {
      const body = await response.json()
      setMessage({ type: 'error', message: body.message })
    }
    setSaving(false)
  }

  if (isLoading) return <PageLoading />

  return <>
    <Helmet> <title>Abacus | Admin Settings</title> </Helmet>
    <Block center size='xs-6'>
      <StatusMessage message={message} onDismiss={() => setMessage(undefined)} />
      <Form onSubmit={handleSubmit}>
        <h1>Settings</h1>
        <hr />

        <h3>Competition Settings</h3>

        <Form.Input
          label="Competition Display Name"
          type="text"
          required
          onChange={handleChange}
          value={settings.competition_name}
          name="competition_name"
        />

        <Form.Input
          label="Practice Display Name"
          type="text"
          required
          onChange={handleChange}
          value={settings.practice_name}
          name="practice_name"
        />

        <h3>Practice Period</h3>

        <Form.Group widths='equal'>
          <Form.Field label='Start Date' control={Input} type='date' onChange={handleChange} name='practice_start_date' value={settings.practice_start_date} />
          <Form.Field label='Start Time' control={Input} type='time' onChange={handleChange} name='practice_start_time' value={settings.practice_start_time} />
        </Form.Group>

        <Form.Group widths='equal'>
          <Form.Field label='End Date' control={Input} type='date' onChange={handleChange} name='practice_end_date' value={settings.practice_end_date} />
          <Form.Field label='End Time' control={Input} type='time' onChange={handleChange} name='practice_end_time' value={settings.practice_end_time} />
        </Form.Group>

        <h3>Competition Time</h3>

        <Form.Group widths='equal'>
          <Form.Field label='Start Date' control={Input} type='date' onChange={handleChange} name='start_date' value={settings.start_date} />
          <Form.Field label='Start Time' control={Input} type='time' onChange={handleChange} name='start_time' value={settings.start_time} />
        </Form.Group>

        <Form.Group widths='equal'>
          <Form.Field label='End Date' control={Input} type='date' onChange={handleChange} name='end_date' value={settings.end_date} />
          <Form.Field label='End Time' control={Input} type='time' onChange={handleChange} name='end_time' value={settings.end_time} />
        </Form.Group>

        <h3>Scoring System</h3>
        <Form.Field label='Points per Yes' control={Input} type='number' name='points_per_yes' value={settings.points_per_yes} onChange={handleChange} />
        <Form.Field label='Points per No' control={Input} type='number' name='points_per_no' value={settings.points_per_no} onChange={handleChange} />
        <Form.Field label='Points per Compilation Error' control={Input} type='number' name='points_per_compilation_error' value={settings.points_per_compilation_error} onChange={handleChange} />
        <Form.Field label='Points per Minute (1st Yes)' control={Input} type='number' name='points_per_yes' value={settings.points_per_minute} onChange={handleChange} />

        <Button primary loading={isSaving} disabled={isSaving}>Save</Button>
      </Form>
    </Block>
  </>
}

export default Settings