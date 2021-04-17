import { Submission } from 'abacus'
import React, { useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { NotFound, PageLoading, StatusMessage, SubmissionView } from 'components'
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
  const [isRerunning, setRerunning] = useState(false)
  const [isReleasing, setReleasing] = useState(false)
  const [isClaiming, setClaiming] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string>()

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

  const rerun = async () => {
    if (!setSubmission) return
    setRerunning(true)
    const response = await fetch(`${config.API_URL}/submissions/rerun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid: submission.sid })
    })
    if (response.ok) {
      const result = await response.json()
      if (result.submissions && submission.sid in result.submissions) {
        setSubmission({ team: submission?.team, problem: submission?.problem, ...result.submissions[submission.sid] })
      }
    } else {
      try {
        const { message } = await response.json()
        setError(message)
      } catch (_err) { return }
    }
    setRerunning(false)
  }
  const release = async () => {
    if (!setSubmission) return
    if (!submission) return
    setReleasing(true)
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sid: submission.sid,
        feedback: submission.feedback,
        score: submission.score,
        released: true,
        claimed: undefined,
        status: submission.status,
      })
    })
    if (response.ok) {
      const result = await response.json()
      setSubmission({ ...submission, released: result.released, claimed: undefined })
    } else {
      try {
        const { message } = await response.json()
        setError(message)
      } catch (_err) { return }
    }
    setReleasing(false)
  }

  const claim = async (sid: string) => {
    setClaiming({ ...isClaiming, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, claimed: user?.uid })
    })

    if (response.ok) {
      setSubmission({ ...submission, claimed: user })
    } else {
      try {
        const { message } = await response.json()
        setError(message)
      } catch (_err) { return }
    }

    setClaiming({ ...isClaiming, [sid]: false })
  }

  const unclaim = async (sid: string) => {
    setClaiming({ ...isClaiming, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, claimed: null })
    })

    if (response.ok) {
      setSubmission({ ...submission, claimed: undefined })
    } else {
      try {
        const { message } = await response.json()
        setError(message)
      } catch (_err) { return }
    }

    setClaiming({ ...isClaiming, [sid]: false })
  }

  const download = () => submission?.source && submission.filename &&
    saveAs(new File([submission?.source], submission.filename, { type: 'text/plain;charset=utf-8' }))


  return <>
    <Helmet> <title>Abacus | Judge Submission</title> </Helmet>

    {error && <StatusMessage message={{ type: 'error', message: error }} />}

    <Button content='Back' icon='arrow left' labelPosition='left' onClick={history.goBack} />

    {!submission.released ?
      (submission.claimed ?
        <>
          {submission.claimed?.uid === user?.uid ?
            <>
              <Button content="Unclaim" icon={'hand paper'} onClick={() => unclaim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} />
              {submission.division == 'blue' && <Button disabled={isRerunning || submission.claimed?.uid != user?.uid} loading={isRerunning} content="Rerun" icon="redo" labelPosition="left" onClick={rerun} />}
              <Button loading={isReleasing} disabled={isReleasing || submission.claimed?.uid != user?.uid} icon="right arrow" content="Release" labelPosition="left" onClick={release} />
            </> :
            <Button content="Claimed" icon={'lock'} disabled={true} labelPosition={'left'} />
          }
        </> :
        <Button content="Claim" icon={'hand rock'} onClick={() => claim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} />
      ) :
      <Button icon="check" positive content="Released" labelPosition="left" />
    }

    {submission.division == 'blue' && <Button content="Download" icon="download" labelPosition="left" onClick={download} />}

    <SubmissionView
      submission={submission}
      rerunning={isRerunning}
      setSubmission={!submission.released && submission.claimed?.uid == user?.uid ? setSubmission : undefined}
    />
  </>
}

export default submission