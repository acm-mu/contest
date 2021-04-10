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
  const [isRerunning, setRerunning] = useState(false)
  const [isReleasing, setReleasing] = useState(false)
  const [isDeleting, setDeleting] = useState(false)
  const [isClaiming, setClaiming] = useState<{ [key: string]: boolean }>({})

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

  const deleteSubmission = async () => {
    setDeleting(true)
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid: submission.sid })
    })
    if (response.ok) {
      history.push(`/${user?.role}/submissions`)
    }
    setDeleting(false)
  }

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
      body: JSON.stringify({ sid: submission.sid, released: true, claimed: undefined })
    })
    if (response.ok) {
      const result = await response.json()
      setSubmission({ ...submission, released: result.released, claimed: undefined })
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
    }

    setClaiming({ ...isClaiming, [sid]: false })
  }

  const download = () => submission?.source && submission.filename &&
    saveAs(new File([submission?.source], submission.filename, { type: 'text/plain;charset=utf-8' }))


  return <>
    <Helmet> <title>Abacus | Judge Submission</title> </Helmet>

    <Button content='Back' icon='arrow left' labelPosition='left' onClick={history.goBack} />
    <Button disabled={isRerunning || submission.claimed?.uid != user?.uid} loading={isRerunning} content="Rerun" icon="redo" labelPosition="left" onClick={rerun} />
    {submission.claimed ?
      (submission.claimed?.uid === user?.uid ?
        <Button content="Unclaim" icon={'hand paper'} onClick={() => unclaim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} /> :
        <Button content="Claimed" icon={'lock'} disabled={true} labelPosition={'left'} />
      ) :
      <Button content="Claim" icon={'hand rock'} onClick={() => claim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} />}
    {submission.released ?
      <Button icon="check" positive content="Released" labelPosition="left" /> :
      <Button loading={isReleasing} disabled={isReleasing || submission.claimed?.uid != user?.uid} icon="right arrow" content="Release" labelPosition="left" onClick={release} />}
    <Button content="Download" icon="download" labelPosition="left" onClick={download} />
    <Button disabled={isDeleting || submission.claimed?.uid != user?.uid} loading={isDeleting} content="Delete" icon="trash" negative labelPosition="left" onClick={deleteSubmission} />

    <SubmissionView submission={submission} rerunning={isRerunning} />
  </>
}

export default submission