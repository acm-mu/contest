import { Problem, Submission } from "abacus";
import React, { ChangeEvent, SyntheticEvent, useContext, useEffect, useMemo, useState } from "react";
import { Form, DropdownProps, InputOnChangeData, Breadcrumb } from "semantic-ui-react";
import { Block, PageLoading, ScratchViewer, StatusMessage, Unauthorized } from "components";
import config from "environment"
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { AppContext } from "context";

const Submit = (): JSX.Element => {
  const { pid: problem_id } = useParams<{ pid: string }>()
  const [problems, setProblems] = useState<{ [key: string]: Problem }>({})
  const [problem, setProblem] = useState<Problem>()

  const { project_id: default_project_id } = useParams<{ project_id: string }>()
  const [project_url, setProjectUrl] = useState<string>(`https://scratch.mit.edu/projects/${default_project_id || ''}`)
  const [description, setDescription] = useState<string>()

  const [isLoading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(true)
  const [isSubmitting, setSubmitting] = useState(false)

  const [error, setError] = useState<string>()

  const { user } = useContext(AppContext)

  const history = useHistory()

  const project_id = useMemo(() => {
    const match = project_url.match(/https:\/\/scratch\.mit\.edu\/projects\/(\d*)/)
    if (match) return match[1]
    return undefined
  }, [project_url])

  useEffect(() => {
    loadProblems()
    return () => { setMounted(false) }
  }, [])

  const loadProblems = async () => {
    const response = await fetch(`${config.API_URL}/problems?division=gold&columns=design_document`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })
    if (response.ok && isMounted) {
      const problems: { [key: string]: Problem } = await response.json()
      for (const prob of Object.values(problems))
        if (prob.id == problem_id) setProblem(prob)

      setProblems(problems)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!(problem && project_id)) return
    setSubmitting(true)
    const formData = new FormData()
    formData.set('pid', problem.pid)
    formData.set('project_id', project_id)
    if (description)
      formData.set('design_document', description)

    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: formData
    })

    if (response.status !== 200) {
      setSubmitting(false)
      const { message } = await response.json()
      setError(message)
      return
    }

    const body: Submission = await response.json()

    setSubmitting(false)
    history.push(`/gold/submissions/${body.sid}`)
  }

  const handleProblemChange = (event: SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => value && setProblem(problems[`${value}`])
  const handleChange = async (event: ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => setProjectUrl(value)

  if (isLoading) return <PageLoading />
  if (user?.division != 'gold' && user?.role != 'admin') return <Unauthorized />

  return <>
    <Helmet> <title>Abacus | Gold Submit</title> </Helmet>
    <Block transparent size='xs-12'>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to='/gold/problems' content="Problems" />
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to={`/gold/problems/${problem?.id}`} content={problem?.name} />
        <Breadcrumb.Divider />
        <Breadcrumb.Section active content="Submit" />
      </Breadcrumb>
    </Block>
    {error && <StatusMessage message={{ type: 'error', message: error }} />}
    <Block size='xs-12'>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Select
            width={4}
            label='Problem'
            placeholder='Problem'
            name='problem'
            value={problem?.pid}
            onChange={handleProblemChange}
            options={Object.values(problems).map((problem) => ({ key: problem.pid, text: problem.name, value: problem.pid }))}
          />
          <Form.Input
            width={4}
            label='Project Url'
            onChange={handleChange}
            placeholder="https://scratch.mit.edu/projects/<project_id>"
            value={project_url}
          />
          <Form.Button
            label="&nbsp;"
            color="orange"
            content="Submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </Form.Group>
      </Form>
    </Block>

    <Block transparent size='xs-12'>
      <ScratchViewer project_id={project_id} />
    </Block>


    {problem?.design_document == true ?
      <Block transparent size='xs-12'>
        <h2>Design Document</h2>
        <MDEditor
          value={description || ''}
          onChange={value => setDescription(value || '')}
          height="500" />
      </Block>
      : <></>}
  </>
}

export default Submit