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

  const claimedSubmissions = useMemo(() => submissions?.filter(({ claimed, released }) => !released && claimed !== undefined && claimed?.uid !== user?.uid).sort((p1, p2) => p1.date - p2.date), [submissions])
  const pendingSubmissions = useMemo(() => submissions?.filter(({ released, claimed }) => !released && !claimed).sort((p1, p2) => p1.date - p2.date), [submissions])
  const recentSubmissions = useMemo(() => submissions?.filter(({ released }) => released).sort((p1, p2) => p2.date - p1.date), [submissions])
  const myClaimedSubmissions = useMemo(() => submissions?.filter(({ released, claimed }) => !released && claimed?.uid == user?.uid).sort((p1, p2) => p1.date - p2.date), [submissions])

  const loadData = async () => {
    const response = await fetch(`${config.API_URL}/submissions`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })

    if (!isMounted) return

    if (response.ok) {
      const data = await response.json()
      const submissions = Object.values(data) as Submission[]
      setSubmissions(submissions.filter(submission => !submission.team.disabled))
    }
  }

  useEffect(() => {
    loadData().then(() => setLoading(false))
    socket?.on('new_submission', loadData)
    socket?.on('update_submission', loadData)
    return () => { setMounted(false) }
  }, [])

  if (isLoading) return <PageLoading />
  if (!user) return <Unauthorized />

  return <>

    <Helmet><title>Abacus | Judging Dashboard</title></Helmet>

    <Block transparent size='xs-6'>
      <h1><Link to='/judge/submissions?filter=my_claimed'>My Claimed Submissions</Link></h1>
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
            myClaimedSubmissions.slice(0, 5).map(submission =>
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
      <h1><Link to='/judge/submissions?filter=recently_graded'>Recently Graded Submissions</Link></h1>

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
            recentSubmissions.slice(0, 5).map(submission =>
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
      <h1><Link to='/judge/submissions?filter=pending'>Pending Submissions</Link></h1>

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
            pendingSubmissions.slice(0, 5).map(submission =>
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
      <h1><Link to='/judge/submissions?filter=other_claimed'>Claimed Submissions</Link></h1>

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
            claimedSubmissions.slice(0, 5).map(submission =>
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