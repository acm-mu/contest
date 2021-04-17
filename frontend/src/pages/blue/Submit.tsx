import { Problem, Submission } from 'abacus'
import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { Form, Button, Breadcrumb } from 'semantic-ui-react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Block, Countdown, FileDialog, NotFound, PageLoading, StatusMessage, Unauthorized } from 'components'
import config from 'environment'
import { AppContext } from 'context'
import { Language, languages } from 'utils'
import { Helmet } from 'react-helmet'

const Submit = (): JSX.Element => {
  const { user } = useContext(AppContext);
  const [submissions, setSubmissions] = useState<Submission[]>()
  const [problem, setProblem] = useState<Problem>()
  const [isLoading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>()
  const [file, setFile] = useState<File>()
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const history = useHistory()

  const [isMounted, setMounted] = useState(true)

  const { pid } = useParams<{ pid: string }>()
  useEffect(() => {
    loadProblem()
    return () => { setMounted(false) }
  }, [])

  const loadProblem = async () => {
    let response = await fetch(`${config.API_URL}/problems?division=blue&id=${pid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (!isMounted) return

    if (response.ok) {
      const problem = Object.values(await response.json())[0] as Problem

      setProblem(problem)
      if (problem) {
        response = await fetch(`${config.API_URL}/submissions?tid=${user?.uid}&pid=${problem.pid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.accessToken}`
          }
        })

        if (!isMounted) return

        if (response.ok) {
          setSubmissions(Object.values(await response.json()))
        }
      }
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!(language && file && problem && user)) return
    setSubmitting(true)
    const formData = new FormData()
    formData.set('pid', problem.pid)
    formData.set('source', file, file.name)
    formData.set('language', language.key)

    const res = await fetch(`${config.API_URL}/submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: formData
    })

    if (res.status != 200) {
      const { message } = await res.json()
      setError(message)
      setSubmitting(false)
      return
    }

    const body: Submission = await res.json()
    setSubmitting(false)

    history.push(`/blue/submissions/${body.sid}`)
  }

  const uploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files?.length) {
      const file = event.target.files[0]
      const ext = file.name.substring(file.name.lastIndexOf("."), file.name.length)

      if (file.size > 1024 * 1024) {
        alert("File is greater than max size (1024 KB)")
        event.preventDefault()
        return
      }

      for (const language of languages) {
        if (ext == language.file_extension) {
          setLanguage(language)
          setFile(file)
          return
        }
      }
      alert("File type not supported")
      event.preventDefault()
    }
  }

  if (isLoading) return <PageLoading />
  if (!problem) return <NotFound />
  if (user?.division != 'blue' && user?.role != 'admin') return <Unauthorized />

  if (user.disabled) {
    return <>
      <Helmet><title>Abacus | Blue Submit</title></Helmet>
      <Countdown />
      <Block size='xs-12'>
        <h2>Your account has been disabled!</h2>
        <p>You are not allowed to submit problems because your account has been disabled.</p>
      </Block>
    </>
  }

  if (submissions?.filter(e => e.status == "accepted").length !== 0) {
    return <>
      <Helmet><title>Abacus | Blue Submit</title></Helmet>
      <Countdown />
      <Block size='xs-12'>
        <h2>You Already Solved This Problem!</h2>
        <p><Link to={`/blue/submissions/${submissions?.filter(e => e.status === "accepted")[0].sid}`}>Go to your solved submission</Link></p>
      </Block>
    </>
  }

  if (submissions?.filter(({ status, released }) => status == 'pending' || !released).length !== 0) {
    return <>
      <Helmet><title>Abacus | Blue Submit</title></Helmet>
      <Countdown />
      <Block size='xs-12'>
        <h2>Cannot submit to {problem.name}</h2>
        <p>You cannot submit until your last submission has been graded and released!</p>
        <p><Link to='/blue/problems'>Go back to problems.</Link></p>
      </Block>
    </>
  }

  return <>
    <Helmet> <title>Abacus | Blue Submit</title> </Helmet>
    <Countdown />
    <Block transparent size='xs-12'>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to='/blue/problems' content="Problems" />
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to={`/blue/problems/${problem?.id}`} content={problem?.name} />
        <Breadcrumb.Divider />
        <Breadcrumb.Section active content="Submit" />
      </Breadcrumb>
    </Block>
    {error ? <StatusMessage message={{ type: 'error', message: error }} /> : <></>}
    <Block size='xs-12'>
      <h1>Submit a solution to {problem?.name} </h1>

      <Form>
        <FileDialog file={file} onChange={uploadChange} control={(file?: File) => (
          file ? <>
            <h3>Your upload will include the following files:</h3>
            <ul> <li>{file.name}</li></ul>
          </> : <p>
            <b>Drag & drop</b> a file here to upload <br />
            <i>(Or click and choose file)</i>
          </p>
        )} />
        <Form.Select inline label='Language' placeholder="Select Language" value={language?.value} options={languages} />

        <Form.Group>
          <Form.Button primary content="Submit" onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting} />
          <Button onClick={history.goBack}>Cancel</Button>
        </Form.Group>
      </Form>

    </Block>
  </>
}
export default Submit