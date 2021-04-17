import { Block, PageLoading, Unauthorized } from 'components';
import { AppContext, SocketContext } from 'context';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Label, Table } from 'semantic-ui-react';
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

  const flaggedSubmissions = useMemo(() => submissions?.filter(({ flagged }) => flagged).sort(({ date: date1 }, { date: date2 }) => date2 - date1), [submissions])
  const unviewedSubmission = useMemo(() => submissions?.filter(({ viewed }) => !viewed), [submissions])

  const loadData = async () => {
    const response = await fetch(`${config.API_URL}/submissions?division=blue`, {
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

  if (isLoading) return <PageLoading />
  if (user?.role != 'proctor') return <Unauthorized />

  return <>

    <Helmet><title>Abacus | Proctor Dashboard</title></Helmet>

    <Block transparent size='xs-6'>
      <h1>Unviewed Submissions</h1>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Language" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {unviewedSubmission && unviewedSubmission.length > 0 ?
            unviewedSubmission.map(submission =>
              <Table.Row key={`viewed-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/proctor/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/proctor/problems/${submission.pid}`}>{submission.problem.name}</Link>
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
      <h1>Flagged Submissions</h1>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Submission" />
            <Table.HeaderCell content="Problem" />
            <Table.HeaderCell content="Language" />
            <Table.HeaderCell content="Status" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {flaggedSubmissions && flaggedSubmissions.length > 0 ?
            flaggedSubmissions.map(submission =>
              <Table.Row key={`recent-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/proctor/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/proctor/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
                <Table.Cell>
                  {submission.flagged ? <Label color='orange' icon='flag' content={`Flagged: ${submission.flagged.display_name}`} /> : <Label icon='check' content="Unflagged" />}
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