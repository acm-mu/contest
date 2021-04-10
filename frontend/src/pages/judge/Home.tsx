import { Block, PageLoading, Unauthorized } from 'components';
import { AppContext, SocketContext } from 'context';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Table } from 'semantic-ui-react';
import config from 'environment';
import { Submission } from 'abacus';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Home = (): JSX.Element => {

  const { user } = useContext(AppContext)
  const socket = useContext(SocketContext)
  const [isLoading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>()

  const claimedSubmissions = useMemo(() => submissions?.filter(({ claimed }) => claimed !== undefined && claimed?.uid !== user?.uid), [submissions])
  const pendingSubmissions = useMemo(() => submissions?.filter(({ released }) => !released), [submissions])
  const recentSubmissions = useMemo(() => submissions?.filter(({ released }) => released).sort(({ date: date1 }, { date: date2 }) => date2 - date1), [submissions])
  const myClaimedSubmissions = useMemo(() => submissions?.filter(({ claimed }) => claimed?.uid == user?.uid), [submissions])

  console.log(claimedSubmissions?.length)
  console.log(pendingSubmissions?.length)
  console.log(recentSubmissions?.length)
  console.log(myClaimedSubmissions?.length)

  const loadData = async () => {
    const response = await fetch(`${config.API_URL}/submissions`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })

    if (!isMounted) return

    if (response.ok) {
      const data = await response.json()
      setSubmissions(Object.values(data))
    }
  }

  useEffect(() => {
    loadData().then(() => setLoading(false))
    socket?.on('new_submission', loadData)
    socket?.on('update_submission', loadData)
    return () => { setMounted(false) }
  }, [])

  socket?.on('new_submission', loadData)

  if (isLoading) return <PageLoading />
  if (!user) return <Unauthorized />

  return <>

    <Helmet><title>Abacus | Judging Dashboard</title></Helmet>

    <Block transparent size='xs-6'>
      <h1>My Claimed Submissions</h1>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="User" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Language" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {myClaimedSubmissions && myClaimedSubmissions.length > 0 ?
            myClaimedSubmissions.map(submission =>
              <Table.Row key={`my-claimed-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/judge/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/teams/${submission.tid}`}>{submission.team.display_name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
              </Table.Row>
            ) :
            <Table.Row>
              <Table.Cell colSpan={'100%'}>There are no submissions that match this description.</Table.Cell>
            </Table.Row>
          }
        </Table.Body>
      </Table>
    </Block>


    <Block transparent size='xs-6'>
      <h1>Recently Graded Submissions</h1>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="User" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Language" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {recentSubmissions && recentSubmissions.length > 0 ?
            recentSubmissions.map(submission =>
              <Table.Row key={`recent-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/judge/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/teams/${submission.tid}`}>{submission.team.display_name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
              </Table.Row>
            ) :
            <Table.Row>
              <Table.Cell colSpan={'100%'}>There are no submissions that match this description.</Table.Cell>
            </Table.Row>
          }
        </Table.Body>
      </Table>
    </Block>


    <Block transparent size='xs-6'>
      <h1>Pending Submissions</h1>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="User" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Language" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {pendingSubmissions && pendingSubmissions.length > 0 ?
            pendingSubmissions.map(submission =>
              <Table.Row key={`pending-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/judge/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/teams/${submission.tid}`}>{submission.team.display_name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
              </Table.Row>
            ) :
            <Table.Row>
              <Table.Cell colSpan={'100%'}>There are no submissions that match this description.</Table.Cell>
            </Table.Row>
          }
        </Table.Body>
      </Table>
    </Block>

    <Block transparent size='xs-6'>
      <h1>Claimed Submissions</h1>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="User" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Claimer" />
            <Table.HeaderCell content="Language" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {claimedSubmissions && claimedSubmissions.length > 0 ?
            claimedSubmissions.map(submission =>
              <Table.Row key={`claimed-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/judge/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/teams/${submission.tid}`}>{submission.team.display_name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/judge/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.claimed?.display_name}
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
              </Table.Row>
            ) :
            <Table.Row>
              <Table.Cell colSpan={'100%'}>There are no submissions that match this description.</Table.Cell>
            </Table.Row>
          }
        </Table.Body>
      </Table>
    </Block>

  </>
}

export default Home