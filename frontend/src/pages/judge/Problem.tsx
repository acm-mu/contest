import { Problem } from "abacus";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Divider } from "semantic-ui-react";
import MDEditor from "@uiw/react-md-editor";
import { Block, Countdown, NotFound, PageLoading } from 'components'
import config from 'environment'
import { AppContext } from "context";
import "./Problem.scss";
import { Helmet } from "react-helmet";

const problem = (): JSX.Element => {
  const { user } = useContext(AppContext);
  const [isLoading, setLoading] = useState(true)
  const [problem, setProblem] = useState<Problem>();
  const { pid } = useParams<{ pid: string }>()

  const [isMounted, setMounted] = useState(true)

  useEffect(() => {
    loadProblem()
    return () => { setMounted(false) }
  }, []);

  const loadProblem = async () => {
    const response = await fetch(`${config.API_URL}/problems?division=${user?.division}&columns=description&pid=${pid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (!isMounted) return

    if (response.ok) {
      const problem = Object.values(await response.json())[0] as Problem
      setProblem(problem)
    }

    setLoading(false)
  }

  if (isLoading) return <PageLoading />
  if (!problem) return <NotFound />

  return <>
    <Helmet> <title>Abacus | {problem.name}</title> </Helmet>
    <Countdown />

    <Block size='xs-9' className='problem'>
      <h1>Problem {problem.id}: {problem.name}</h1>
      <Divider />
      <MDEditor.Markdown source={problem.description || ''} />
    </Block>
    <Block size='xs-3' className='problem-panel'>
      <p><b>Problem ID:</b> {problem.id}</p>
      <p><b>Problem Name:</b> {problem.name}</p>
      {problem.cpu_time_limit ? <p><b>CPU Time limit:</b> {problem.cpu_time_limit}</p> : <></>}
      {problem.memory_limit ? <p><b>Memory limit:</b> {problem.memory_limit}</p> : <></>}
      <Divider />
      <p><b>Test Data</b></p>
    </Block>

  </>
}

export default problem;
