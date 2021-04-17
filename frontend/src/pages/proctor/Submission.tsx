import { Submission } from 'abacus'
import React, { useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { NotFound, PageLoading, SubmissionView } from 'components'
import config from 'environment'
import { Helmet } from 'react-helmet'
import { Button } from 'semantic-ui-react'
import { AppContext, SocketContext } from 'context'

const submission = (): JSX.Element => {
  const socket = useContext(SocketContext)
  const { sid } = useParams<{ sid: string }>()
  const [submission, setSubmission] = useState<Submission>()
  const [isLoading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(true)
  const [isViewing, setViewing] = useState(false)
  const [isFlagging, setFlagging] = useState<{ [key: string]: boolean }>({})
  const [isUnFlagging, setUnFlagging] = useState<{ [key: string]: boolean }>({})

  const { user } = useContext(AppContext)

  const history = useHistory()

  const loadSubmission = async () => {
    const response = await fetch(`${config.API_URL}/submissions?sid=${sid}`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })

    if (!isMounted) return

    if (response.ok) {
      setSubmission(Object.values(await response.json())[0] as Submission)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSubmission().then(() => setLoading(false))
    socket?.on('update_submission', loadSubmission)
    return () => { setMounted(false) }
  }, [])

  if (isLoading) return <PageLoading />
  if (!submission) return <NotFound />

  const view = async () => {
    setViewing(true)
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sid, viewed: true })
    })
    if (response.ok) {
      setSubmission({ ...submission, viewed: true })
    }
    setViewing(false)
  }

  const flag = async () => {
    setFlagging({ ...isFlagging, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, viewed: true, flagged: user?.uid })
    })

    if (response.ok) {
      setSubmission({ ...submission, viewed: true, flagged: user })
    }

    setFlagging({ ...isFlagging, [sid]: false })
  }

  const unflag = async () => {
    setUnFlagging({ ...isUnFlagging, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, flagged: null })
    })

    if (response.ok) {
      setSubmission({ ...submission, flagged: undefined })
    }

    setUnFlagging({ ...isUnFlagging, [sid]: false })
  }

  return <>
    <Helmet> <title>Abacus | Judge Submission</title> </Helmet>

    <Button content='Back' icon='arrow left' labelPosition='left' onClick={history.goBack} />
    {submission.viewed ?
      <Button content="Viewed" icon='check' disabled={true} labelPosition={'left'} /> :
      <Button content="Mark as Viewed" icon='eye' onClick={view} loading={isViewing} disabled={isViewing} labelPosition={'left'} />}
    {submission.flagged ?
      <Button loading={isUnFlagging[submission.sid]} disabled={isUnFlagging[submission.sid]} icon="warning" color='orange' content="Flagged" labelPosition="left" onClick={unflag} /> :
      <Button loading={isFlagging[submission.sid]} disabled={isFlagging[submission.sid]} icon="flag" content="Flag" labelPosition="left" onClick={flag} />
    }

    <SubmissionView submission={submission} />
  </>
}

export default submission