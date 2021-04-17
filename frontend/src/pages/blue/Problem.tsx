import { Problem, Submission } from "abacus";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Button, Divider } from "semantic-ui-react";
import MDEditor from "@uiw/react-md-editor";
import { Block, Countdown, NotFound, ClarificationModal, PageLoading, Unauthorized } from 'components'
import config from 'environment'
import { AppContext } from "context";
import "./Problem.scss";
import { Helmet } from "react-helmet";
import { userHome } from "utils";

const problem = (): JSX.Element => {
  const { user, settings } = useContext(AppContext);
  const [isLoading, setLoading] = useState(true)
  const [problem, setProblem] = useState<Problem>();
  const { pid } = useParams<{ pid: string }>()

  const [submissions, setSubmissions] = useState<Submission[]>()
  const latestSubmission = useMemo(() => {
    if (!submissions?.length || !user) return <></>
    const { sid } = submissions[submissions.length - 1]
    return <p><b>Last Submission:</b>  <Link to={`${userHome(user)}/submissions/${sid}`}>{sid.substring(0, 7)}</Link></p>
  }, [submissions])

  const [isMounted, setMounted] = useState(true)

  useEffect(() => {
    loadProblem()
    return () => { setMounted(false) }
  }, []);

  const loadProblem = async () => {
    let response = await fetch(`${config.API_URL}/problems?division=blue&columns=description&id=${pid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (!isMounted) return

    if (response.ok) {
      const problem = Object.values(await response.json())[0] as Problem
      setProblem(problem)

      response = await fetch(`${config.API_URL}/submissions?tid=${user?.uid}&pid=${problem?.pid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`
        }
      })

      if (!isMounted) return

      if (response.ok) {
        const submissions = Object.values(await response.json()) as Submission[]
        setSubmissions(submissions)
      }
    }

    setLoading(false)
  }


  if (!settings || new Date() < settings.start_date)
    if (user?.division != 'blue' && user?.role != 'admin') return <Unauthorized />

  if (isLoading) return <PageLoading />
  if (!problem) return <NotFound />

  return <>
    <Helmet> <title>Abacus | {problem.name}</title> </Helmet>
    <Countdown />
    <Block transparent size='xs-12'>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to='/blue/problems' content="Problems" />
        <Breadcrumb.Divider />
        <Breadcrumb.Section active content={problem.name} />
      </Breadcrumb>
    </Block>
    <Block size='xs-9' className='problem'>
      <h1>Problem {problem.id}: {problem.name}</h1>
      <Divider />
      <MDEditor.Markdown source={problem.description || ''} />
    </Block>
    <Block size='xs-3' className='problem-panel'>
      {settings && new Date() < settings?.end_date ? <></> :
        <Button
          disabled={submissions?.filter(({ status, released }) => status == 'accepted' || status == 'pending' || !released).length !== 0}
          as={Link}
          to={`/blue/problems/${problem?.id}/submit`}
          content="Submit"
          icon="upload"
          labelPosition='left'
        />}
      <ClarificationModal
        title={`${problem.name} | `}
        context={{ type: 'pid', id: problem.pid }}
        trigger={<Button content="Ask" icon="question" labelPosition='left' />}
      />
      <a target='_blank' rel='noreferrer' href={`${config.API_URL}/sample_files?pid=${problem.pid}`}>
        <Button
          labelPosition='left'
          content="Skeletons"
          icon="download"
        />
      </a>
      {latestSubmission}
      <Divider />
      <p><b>Problem ID:</b> {problem.id}</p>
      {problem.cpu_time_limit ? <p><b>CPU Time limit:</b> {problem.cpu_time_limit}</p> : <></>}
      {problem.memory_limit ? <p><b>Memory limit:</b> {problem.memory_limit}</p> : <></>}
    </Block>

  </>
}

export default problem;
