import { Problem, Submission } from 'abacus'
import React, { useState, useEffect, useContext } from 'react'
import { Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { Block, Countdown, PageLoading, Unauthorized } from 'components'
import config from 'environment'
import { AppContext } from 'context'
import { Helmet } from 'react-helmet'
import { userHome } from 'utils'

const Problems = (): JSX.Element => {
  const { user, settings } = useContext(AppContext)
  const [isMounted, setMounted] = useState(true)
  const [isLoading, setLoading] = useState(true)
  const [problems, setProblems] = useState<Problem[]>()
  const [submissions, setSubmissions] = useState<{ [key: string]: Submission[] }>()

  const helmet = <Helmet> <title>Abacus | Gold Problems</title> </Helmet>

  useEffect(() => {
    loadProblems()
    return () => { setMounted(false) }
  }, [])

  const loadProblems = async () => {
    let response = await fetch(`${config.API_URL}/problems?division=gold`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (!isMounted) return

    if (response.ok) {
      const problems = Object.values(await response.json()) as Problem[]
      setProblems(problems.sort((p1, p2) => p1.id.localeCompare(p2.id)))

      response = await fetch(`${config.API_URL}/submissions?tid=${user?.uid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`
        }
      })

      if (!isMounted) return

      if (response.ok) {
        const submissions: { [key: string]: Submission[] } = {}
        const userSubmissions: Submission[] = Object.values(await response.json())
        for (const submission of userSubmissions) {
          if (submissions[submission.pid] == undefined) submissions[submission.pid] = []
          submissions[submission.pid].push(submission)
        }
        setSubmissions(submissions)
      }
    }
    setLoading(false)
  }

  const latestSubmission = (pid: string) => {
    if (!submissions || !(pid in submissions) || !user) return <></>
    const subs = submissions[pid]
    subs.sort((s1, s2) => s1.date - s2.date)
    if (subs.length == 0) return <></>
    const submission = subs[subs.length - 1]
    return <Link to={`${userHome(user)}/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
  }

  if (!settings || new Date() < settings.practice_start_date)
    return <>
      {helmet}
      <Countdown />
      <Block size='xs-12'>
        <h1>Competition not yet started!</h1>
        <p>Problem&apos;s will become available as soon as the competition begins.</p>
      </Block>
    </>

  if (isLoading) return <PageLoading />
  if (user?.division != 'gold' && user?.role != 'admin') return <Unauthorized />

  return <>
    {helmet}
    <Countdown />
    <Block size='xs-12' transparent>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Problem Name</Table.HeaderCell>
            <Table.HeaderCell>Last Submission</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!(problems?.length) ?
            <Table.Row>
              <Table.Cell colSpan={'100%'}>We can&apos;t find any problems. If you believe this is an error please contact us.</Table.Cell>
            </Table.Row> :
            problems.map((problem: Problem, index: number) => (
              <Table.Row key={index}>
                <Table.HeaderCell collapsing>{problem.id}</Table.HeaderCell>
                <Table.Cell>
                  <Link to={`/gold/problems/${problem.id}`}>{problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {latestSubmission(problem.pid)}
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </Block>
  </>
}

export default Problems