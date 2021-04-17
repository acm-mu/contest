import { Submission } from 'abacus'
import React, { useContext, useEffect, useState } from 'react'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import { Table } from 'semantic-ui-react'
import { Block, Countdown, PageLoading, Unauthorized } from 'components'
import { AppContext } from 'context'
import { Helmet } from 'react-helmet'
import config from 'environment'
import 'components/Icons.scss'

const Submissions = (): JSX.Element => {
  const { user } = useContext(AppContext)
  const [isMounted, setMounted] = useState(true)
  const [isLoading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>()

  useEffect(() => {
    loadSubmissions()
    return () => { setMounted(false) }
  }, [])

  const loadSubmissions = async () => {
    const response = await fetch(`${config.API_URL}/submissions?division=gold&tid=${user?.uid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })
    if (!isMounted) return
    if (response.ok) {
      setSubmissions(Object.values(await response.json()))
    }
    setLoading(false)
  }

  if (!user) return <Unauthorized />
  if (isLoading) return <PageLoading />
  if (user?.division != 'gold' && user?.role != 'admin') return <Unauthorized />

  return <>
    <Helmet> <title>Abacus | Gold Submissions</title> </Helmet>
    <Countdown />
    <Block size='xs-12' transparent>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Submission ID</Table.HeaderCell>
            <Table.HeaderCell>Problem</Table.HeaderCell>
            <Table.HeaderCell>Submission #</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Time</Table.HeaderCell>
            <Table.HeaderCell>Score</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {submissions?.length != 0 ?
            (submissions?.sort((s1, s2) => s2.date - s1.date).map((submission: Submission, index: number) => (
              <Table.Row key={index}>
                <Table.Cell><Link to={`/gold/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link></Table.Cell>
                <Table.Cell><Link to={`/gold/problems/${submission.problem.id}`}>{submission.problem?.name} </Link></Table.Cell>
                <Table.Cell>{submission.sub_no + 1}</Table.Cell>
                <Table.Cell><span className={`icn status ${submission.status}`} /></Table.Cell>
                <Table.Cell><Moment fromNow date={submission.date * 1000} /></Table.Cell>
                <Table.Cell>{submission.score}</Table.Cell>
              </Table.Row>
            ))) : (
              <Table.Row>
                <Table.Cell colSpan={'100%'}>
                  You don&lsquo;t have any submissions yet. Go create a project!
                </Table.Cell>
              </Table.Row>
            )}
        </Table.Body>
      </Table>
    </Block>
  </>
}

export default Submissions