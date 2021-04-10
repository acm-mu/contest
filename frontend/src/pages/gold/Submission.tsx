import { Submission } from "abacus"
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Block, Countdown, NotFound, PageLoading, SubmissionView } from "components"
import { Helmet } from "react-helmet"
import config from 'environment';
import { Breadcrumb } from "semantic-ui-react"

const submission = (): JSX.Element => {
  const { sid } = useParams<{ sid: string }>()
  const [submission, setSubmission] = useState<Submission>()
  const [isMounted, setMounted] = useState(true)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmission()
    return () => { setMounted(false) }
  }, [])

  const loadSubmission = async () => {
    const response = await fetch(`${config.API_URL}/submissions?sid=${sid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (!isMounted) return

    if (response.ok) {
      setSubmission(Object.values(await response.json())[0] as Submission)
    }

    setLoading(false)
  }

  if (isLoading) return <PageLoading />
  if (!submission) return <NotFound />

  return <>
    <Helmet> <title>Abacus | Gold Submission</title> </Helmet>
    <Countdown />
    <Block transparent size='xs-12'>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to='/gold/submissions' content="Submissions" />
        <Breadcrumb.Divider />
        <Breadcrumb.Section active content={submission.sid.substring(0, 7)} />
      </Breadcrumb>
    </Block>
    <SubmissionView submission={submission} />
  </>
}

export default submission