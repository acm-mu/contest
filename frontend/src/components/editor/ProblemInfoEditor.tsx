import React, { ChangeEvent, FormEvent } from 'react';
import { CheckboxProps, Form, Input, Select } from 'semantic-ui-react';
import { divisions } from 'utils';
import { ProblemStateProps } from '.';

const ProblemInfoEditor = ({ problem, setProblem }: ProblemStateProps): JSX.Element => {
  if (!problem || !setProblem) return <></>

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => setProblem({ ...problem, [name]: value })
  const handleCheckChange = (_event: FormEvent<HTMLInputElement>, { name, checked }: CheckboxProps) => name && setProblem({ ...problem, [name]: checked })

  const handleSelectChange = (_: never, { value }: HTMLInputElement) => {
    if (value == 'gold') {
      setProblem({
        ...problem,
        division: 'gold',
        max_points: 0,
        capped_points: false,
        skeletons: undefined,
        solutions: undefined,
        tests: undefined
      })
    } else if (value == 'eagle') {
      setProblem({
        ...problem,
        division: 'eagle'
      })
    } else if (value == 'blue') {

      const filename = problem.name.replace(/[ !@#$%^&*()-]/g, '')
      setProblem({
        ...problem,
        division: 'blue',
        project_id: undefined,
        skeletons: [
          { source: '# Python skeleton goes here', file_name: `${filename}.py`, language: 'python' },
          { source: '// Java skeleton goes here', file_name: `${filename}.java`, language: 'java' }
        ],
        solutions: [
          { source: '# Python solution goes here', file_name: `${filename}.py`, language: 'python' },
          { source: '// Java solution goes here', file_name: `${filename}.java`, language: 'java' }
        ],
        tests: [{ in: '', out: '' }]
      })
    }
  }

  return <Form>
    <Form.Group widths='equal'>
      <Form.Field label='Problem ID' name='id' control={Input} onChange={handleChange} value={problem?.id || ''} />
      <Form.Field label='Problem Name' name='name' control={Input} onChange={handleChange} value={problem?.name || ''} />
      <Form.Field
        control={Select}
        onChange={handleSelectChange}
        label='Division'
        name='division'
        options={divisions}
        value={problem?.division || ''}
        placeholder='Division'
        required />
    </Form.Group>

    {problem.division == 'gold' ? <Form.Group style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Field label='Max Points' name='max_points' control={Input} onChange={handleChange} value={problem?.max_points} />
      <Form.Checkbox label='Capped Points' name='capped_points' onChange={handleCheckChange} checked={problem?.capped_points} />
      <Form.Checkbox label='Design Document' name='design_document' onChange={handleCheckChange} checked={problem.design_document} />
    </Form.Group> : <></>}

    <Form.Checkbox label='Practice Problem' name='practice' onChange={handleCheckChange} checked={problem.practice || false} />
    {/* {problem?.division == 'blue' ? <Form.Group widths='equal'>
      <Form.Field label='Memory Limit' name='memory_limit' control={Input} onChange={handleChange} value={problem?.memory_limit || ''} />
      <Form.Field label='CPU Time Limit' name='cpu_time_limit' control={Input} onChange={handleChange} value={problem?.cpu_time_limit || ''} />
    </Form.Group>
     : <></>} */}
  </Form>
}

export default ProblemInfoEditor