import { Problem, Submission } from "abacus";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Button, Message } from "semantic-ui-react";
import MDEditor from "@uiw/react-md-editor";
import { Block, Countdown, NotFound, ClarificationModal, PageLoading, Unauthorized } from 'components'
import config from 'environment'
import { AppContext } from "context";
import { Helmet } from "react-helmet";
import { userHome } from "utils";

const problem = (): JSX.Element => {
  const { user } = useContext(AppContext)
  const [isLoading, setLoading] = useState(true)
  const [problem, setProblem] = useState<Problem>()
  const { pid } = useParams<{ pid: string }>()

  const [submissions, setSubmissions] = useState<Submission[]>()
  const latestSubmission = useMemo(() => {
    if (!submissions?.length || !user) return <></>
    const { sid } = submissions[submissions.length - 1]
    return <p><b>Last Submission:</b>  <Link to={`${userHome(user)}/submissions/${sid}`}>{sid.substring(0, 7)}</Link></p>
  }, [submissions])

  const [isMounted, setMounted] = useState(true)

  useEffect(() => {
    loadProblem().then(() => {
      setLoading(false)
    })
    return () => { setMounted(false) }
  }, [])

  const loadProblem = async () => {
    let response = await fetch(`${config.API_URL}/problems?division=gold&id=${pid}&columns=description,project_id,design_document`, {
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
        setSubmissions(Object.values(await response.json()))
      }
    }
  }

  if (isLoading) return <PageLoading />
  if (!problem) return <NotFound />
  if (user?.division != 'gold' && user?.role != 'admin') return <Unauthorized />

  return <>
    <Helmet> <title>Abacus | {problem.name}</title> </Helmet>
    <Countdown />
    <Block transparent size='xs-12'>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to='/gold/problems' content="Problems" />
        <Breadcrumb.Divider />
        <Breadcrumb.Section active content={problem.name} />
      </Breadcrumb>
    </Block>
    <Block size='xs-9' className='problem'>
      <h1>Problem {problem?.id}: {problem?.name}</h1>
      <hr />
      <MDEditor.Markdown source={problem?.description || ''} />

      {problem.design_document == true ? <Message icon='file text' color='blue' header="Design Document" content="In addition to your Scratch project, submit a short description describing the features of your project. It doesn't have to be too formal or long - just list the primary ways your user can interact with the project and describe the features you're most proud of. Pretend you're selling your solution - make sure the judges know about all the features you spent your time on!" /> : <></>}
    </Block>

    <Block size='xs-3' className='problem-panel'>
      <Button
        disabled={submissions?.filter(({ status, released }) => status == 'pending' || !released).length !== 0}
        as={Link}
        to={`/gold/problems/${problem?.id}/submit`}
        content="Submit"
        icon="upload"
      />
      <ClarificationModal
        title={`${problem.name} | `}
        context={{ type: 'pid', id: problem.pid }}
        trigger={<Button content="Ask" icon="question" />}
      />
      {problem.project_id ?
        <a
          rel="noreferrer"
          target="_blank"
          href={`https://scratch.mit.edu/projects/${problem?.project_id}`}
        >
          <Button
            color='orange'
            content="Template"
            icon='linkify'
          />
        </a> : <Message warning><b>Note:</b> A project template is not provided for this problem.</Message>}
      {latestSubmission}
    </Block>
  </>
}

export default problem