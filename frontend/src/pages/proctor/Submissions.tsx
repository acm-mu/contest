import { Submission } from 'abacus'
import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Checkbox, Label, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import config from 'environment'
import { compare } from 'utils'
import { Helmet } from 'react-helmet'
import { PageLoading } from 'components'
import { AppContext, SocketContext } from 'context'

type SortKey = 'date' | 'sid' | 'sub_no' | 'language'
type SortConfig = {
  column: SortKey,
  direction: 'ascending' | 'descending'
}

const Submissions = (): JSX.Element => {
  const socket = useContext(SocketContext)
  const [isLoading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isMounted, setMounted] = useState(true)
  const [showViewed, setShowViewed] = useState(false)

  const { user } = useContext(AppContext)

  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'date',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, submission_list: Submission[] = submissions) => {
    const newDirection = column === newColumn && direction == 'ascending' ? 'descending' : 'ascending'
    setSortConfig({ column: newColumn, direction: newDirection })

    setSubmissions(submission_list.sort((s1: Submission, s2: Submission) =>
    (compare(s1[newColumn] || 'ZZ', s2[newColumn] || 'ZZ') * (direction == 'ascending' ? 1 : -1)
    )))
  }

  useEffect(() => {
    loadSubmissions().then(() => setLoading(false))
    socket?.on('new_submission', loadSubmissions)
    socket?.on('update_submission', loadSubmissions)
    return () => setMounted(false)
  }, [])

  const loadSubmissions = async () => {
    const response = await fetch(`${config.API_URL}/submissions?division=blue`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })
    const submissions = Object.values(await response.json()) as Submission[]

    if (!isMounted) return

    setSubmissions(submissions.map(submission => ({ ...submission, checked: false })))
  }

  const onFilterChange = () => setShowViewed(!showViewed)

  const filteredSubmissions = useMemo(() =>
    submissions.filter((submission) => showViewed || (!submission.viewed && !submission.flagged))
    , [submissions, showViewed])

  if (isLoading) return <PageLoading />

  return <>
    <Helmet><title>Abacus | Proctor Submissions</title></Helmet>
    <Checkbox toggle label="Show Viewed" checked={showViewed} onClick={onFilterChange} />

    <Table singleLine sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell className='sortable' onClick={() => sort('sid')} sorted={column == 'sid' ? direction : undefined}>Submission ID</Table.HeaderCell>
          <Table.HeaderCell>Problem</Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('language')} sorted={column == 'language' ? direction : undefined}>Language</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {filteredSubmissions.length == 0 ?
          <Table.Row>
            <Table.Cell colSpan={'100%'}>No Submissions</Table.Cell>
          </Table.Row> :
          filteredSubmissions.map((submission) =>
            <Table.Row key={submission.sid}>
              <Table.Cell>
                <Link to={`/${user?.role}/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
              </Table.Cell>
              <Table.Cell><Link to={`/${user?.role}/problems/${submission.pid}`}>{submission.problem?.name} </Link></Table.Cell>
              <Table.Cell>{submission.language}</Table.Cell>
              <Table.Cell>
                {submission.flagged ? <Label color='orange' icon='flag' content={`Flagged: ${submission.flagged.uid === user?.uid ? 'You' : submission.flagged.display_name}`} /> :
                  (submission.viewed ?
                    <Label icon='eye' color='green' content="Viewed" /> :
                    <Label icon='cloud download' content="Unviewed" />
                  )
                }
              </Table.Cell>
            </Table.Row>)}
      </Table.Body>
    </Table>
  </>
}

export default Submissions