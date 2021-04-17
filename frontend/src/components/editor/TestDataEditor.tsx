import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { Form, Grid, Menu, MenuItemProps, TextArea } from 'semantic-ui-react';
import { ProblemStateProps } from '.';

const TestDataEditor = ({ problem, setProblem }: ProblemStateProps): JSX.Element => {
  const [activeTestItem, setActiveTestItem] = useState(0)

  if (!problem) return <></>

  const handleTestItemClick = (event: MouseEvent, data: MenuItemProps) => setActiveTestItem(data.tab)
  const handleNewTest = () => {
    if (setProblem !== undefined) {
      setProblem({ ...problem, tests: [...problem.tests || [], { in: '', out: '', include: false }] })
      setActiveTestItem(problem.tests?.length || 0)
    }
  }

  const handleDeleteTest = () => {
    if (setProblem !== undefined) {
      if (problem.tests && problem.tests.length > 0) {
        setActiveTestItem(problem.tests.length - 2)
        setProblem({ ...problem, tests: problem.tests.filter((_, index) => index != activeTestItem) })
      }
    }
  }

  const handleTestChange = ({ target: { name, value } }: ChangeEvent<HTMLTextAreaElement>) => {
    if (setProblem !== undefined) {
      setProblem({
        ...problem, tests: problem.tests?.map((test, index) => {
          if (name == `${index}-in`)
            test.in = value
          else if (name == `${index}-out`)
            test.out = value
          return test
        })
      })
    }
  }

  return <Form>
    <Menu>
      {problem?.tests?.map((_test, index) => (
        <Menu.Item name={`${index + 1}`} key={`${index}-test-tab`} tab={index} active={activeTestItem === index} onClick={handleTestItemClick} />
      ))}
      {setProblem &&
        <Menu.Menu position='right'>
          <Menu.Item onClick={handleNewTest}>New</Menu.Item>
          {problem.tests && problem.tests?.length > 1 ? <Menu.Item onClick={handleDeleteTest}>Delete</Menu.Item> : <></>}
        </Menu.Menu>
      }
    </Menu>

    {problem.tests?.map((test, index) => (
      <div key={`test-${index}`}>
        {activeTestItem == index ?
          setProblem !== undefined ?
            <Form.Group widths='equal'>
              <Form.Field label='Input' onChange={handleTestChange} control={TextArea} rows={10} name={`${index}-in`} value={test.in} />
              <Form.Field label='Answer' onChange={handleTestChange} control={TextArea} rows={10} name={`${index}-out`} value={test.out} />
            </Form.Group> :
            <Grid columns={2}>
              <Grid.Column>
                <b>Input</b>
                <pre>{test.in}</pre>
              </Grid.Column>
              <Grid.Column>
                <b>Output</b>
                <pre>{test.out}</pre>
              </Grid.Column>
            </Grid>
          : <></>}
      </div>
    ))}
  </Form>
}

export default TestDataEditor