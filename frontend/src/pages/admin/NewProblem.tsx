import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import MarkdownView from 'react-showdown'
import { Form, Input, Button, Menu, TextArea, Message, MenuItemProps } from "semantic-ui-react"
import { Block } from '../../components'
import { TestType } from '../../types'
import config from '../../environment'

const NewProblem = (): JSX.Element => {
  const history = useHistory()
  const [problem, setProblem] = useState({
    id: '',
    problem_name: '',
    description: '',
    division: 'blue',
    tests: [{ in: '', out: '', result: '' }],
    cpu_time_limit: -1,
    memory_limit: -1
  })
  const [message, setMessage] = useState<{ type: string, message: string }>()
  const handleSubmit = async () => {
    const res = await fetch(`${config.API_URL}/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(problem)
    })
    const body = await res.json()
    if (res.status == 200) {
      history.push(`/admin/problems`)
    } else {
      setMessage({ type: 'error', message: body.message })
    }
  }

  const [activeTestItem, setActiveTestItem] = useState(0)
  const handleTestItemClick = (event: React.MouseEvent, data: MenuItemProps) => setActiveTestItem(data.tab)
  const handleNewTest = () => {
    if (problem) {
      setProblem({ ...problem, tests: [...problem.tests, { in: '', out: '', result: '' }] })
      setActiveTestItem(problem.tests.length)
    }
  }
  const handleDeleteTest = () => {
    if (problem) {
      setActiveTestItem(problem.tests.length - 2)
      setProblem({ ...problem, tests: problem.tests.filter((_, index: number) => index != activeTestItem) })
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (problem)
      setProblem({ ...problem, [name]: value })
  }

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target
    event.target.style.height = `${event.target.scrollHeight}px`
    if (problem)
      setProblem({ ...problem, [name]: value })
  }

  const handleTestChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target
    if (problem)
      setProblem({
        ...problem, tests: problem.tests.map((test: TestType, index: number) => {
          if (name == `${index}-in`)
            test.in = value
          else if (name == `${index}-out`)
            test.out = value
          return test
        })
      })
  }

  return (
    <>
      <h1>New Problem</h1>
      <Block size='xs-12' transparent>
        <> {message ?
          (() => {
            switch (message.type) {
              case 'error':
                return (<Message error>{message.message}</Message>)
              case 'success':
                return <Message success>{message.message}</Message>
            }
          })() : <></>} </>
        <Form style={{ padding: '20px', background: 'white', border: '1px solid #d4d4d5', borderTop: 'none' }}>
          <h1>Problem Info</h1>
          <Form.Field label='Problem ID' name='id' control={Input} onChange={handleChange} placeholder="Problem Id" value={problem?.id || ''} />
          <Form.Field label='Problem Name' name='problem_name' control={Input} onChange={handleChange} placeholder="Problem Name" value={problem?.problem_name || ''} />
          <Form.Group widths='equal'>
            <Form.Field label='Memory Limit' name='memory_limit' control={Input} onChange={handleChange} value={problem?.memory_limit || -1} />
            <Form.Field label='CPU Time Limit' name='cpu_time_limit' control={Input} onChange={handleChange} value={problem?.cpu_time_limit || -1} />
          </Form.Group>

          <h1>Test Data</h1>
          <Menu >
            {problem?.tests.map((test: TestType, index: number) => (
              <Menu.Item name={`${index + 1}`} key={`${index}-test-tab`} tab={index} active={activeTestItem === index} onClick={handleTestItemClick} />
            ))}
            <Menu.Menu position='right'>
              <Menu.Item onClick={handleNewTest}>New</Menu.Item>
              <Menu.Item onClick={handleDeleteTest}>Delete</Menu.Item>
            </Menu.Menu>
          </Menu>

          {
            problem?.tests.map((test: TestType, index: number) => (
              <div key={`test-${index}`}>
                {activeTestItem == index ?
                  <Form.Group widths='equal'>
                    <Form.Field label='Input' onChange={handleTestChange} control={TextArea} name={`${index}-in`} value={test.in} />
                    <Form.Field label='Answer' onChange={handleTestChange} control={TextArea} name={`${index}-out`} value={test.out} />
                  </Form.Group>
                  : <></>}
              </div>
            ))
          }

          <h1>Problem Description</h1>
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Problem Description</label>
              <TextArea name='description' onChange={handleTextareaChange} value={problem?.description || ''} style={{ height: '100%', overflowY: 'hidden' }} />
            </Form.Field>
            <Form.Field>
              <label>Preview</label>
              <div className="markdown" id='preview'>
                <MarkdownView markdown={problem?.description || ""} />
              </div>
            </Form.Field>
          </Form.Group>
          <h1>Sample Files</h1>

          <Button primary onClick={handleSubmit}>Create</Button>
        </Form>
      </Block>
    </>
  )
}


export default NewProblem