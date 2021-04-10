import { Submission } from 'abacus'
import React, { ChangeEvent, useState, useEffect, useMemo, useContext } from 'react'
import { Button, Checkbox, Label, Table } from 'semantic-ui-react'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import config from 'environment'
import { compare } from 'utils'
import { Helmet } from 'react-helmet'
import { PageLoading } from 'components'
import { AppContext, SocketContext } from 'context'

interface SubmissionItem extends Submission {
  checked: boolean
}
type SortKey = 'date' | 'sid' | 'sub_no' | 'language' | 'status' | 'runtime' | 'date' | 'score'
type SortConfig = {
  column: SortKey,
  direction: 'ascending' | 'descending'
}

const Submissions = (): JSX.Element => {
  const socket = useContext(SocketContext)
  const [isLoading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [isMounted, setMounted] = useState(true)
  const [isDeleting, setDeleting] = useState(false)
  const [isClaiming, setClaiming] = useState<{ [key: string]: boolean }>({})
  const [showReleased, setShowReleased] = useState(false)

  const { user } = useContext(AppContext)

  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'date',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, submission_list: SubmissionItem[] = submissions) => {
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
    const response = await fetch(`${config.API_URL}/submissions?division=${user?.division}`, {
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`
      }
    })
    const submissions = Object.values(await response.json()) as SubmissionItem[]

    if (!isMounted) return

    setSubmissions(submissions.map(submission => ({ ...submission, checked: false })))
  }

  const onFilterChange = () => setShowReleased(!showReleased)

  const downloadSubmissions = () => saveAs(new File([JSON.stringify(submissions, null, '\t')], 'submissions.json', { type: 'text/json;charset=utf-8' }))
  const handleChange = ({ target: { id, checked } }: ChangeEvent<HTMLInputElement>) => setSubmissions(submissions.map(submission => submission.sid == id ? { ...submission, checked } : submission))
  const checkAll = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setSubmissions(submissions.map(submission => ({ ...submission, checked })))

  const deleteSelected = async () => {
    setDeleting(true)
    const submissionsToDelete = submissions.filter(submission => submission.checked).map(submission => submission.sid)
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid: submissionsToDelete })
    })
    if (response.ok) {
      loadSubmissions()
    }
    setDeleting(false)
  }

  const claim = async (sid: string) => {
    setClaiming({ ...isClaiming, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, claimed: user?.uid })
    })

    if (response.ok) {
      setSubmissions(submissions.map(sub => sub.sid == sid ? { ...sub, claimed: user } : sub))
    }

    setClaiming({ ...isClaiming, [sid]: false })
  }

  const unclaim = async (sid: string) => {
    setClaiming({ ...isClaiming, [sid]: true })
    const response = await fetch(`${config.API_URL}/submissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ sid, claimed: null })
    })

    if (response.ok) {
      setSubmissions(submissions.map(sub => sub.sid == sid ? { ...sub, claimed: undefined } : sub))
    }

    setClaiming({ ...isClaiming, [sid]: false })
  }

  const filteredSubmissions = useMemo(() =>
    submissions.filter((submission) => showReleased || !submission.released)
    , [submissions, showReleased])

  if (isLoading) return <PageLoading />

  return <>
    <Helmet><title>Abacus | Judge Submissions</title></Helmet>
    <Button content="Download Submissions" onClick={downloadSubmissions} />
    {submissions.filter(submission => submission.checked).length ?
      <Button content="Delete Selected" negative onClick={deleteSelected} loading={isDeleting} disabled={isDeleting} /> : <></>}
    <Checkbox toggle label="Show Released" checked={showReleased} onClick={onFilterChange} />

    <Table singleLine sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell collapsing><input type='checkbox' onChange={checkAll} /></Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('sid')} sorted={column == 'sid' ? direction : undefined}>Submission ID</Table.HeaderCell>
          <Table.HeaderCell>Problem</Table.HeaderCell>
          <Table.HeaderCell>Team</Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('language')} sorted={column == 'language' ? direction : undefined}>Language</Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('status')} sorted={column == 'status' ? direction : undefined}>Status</Table.HeaderCell>
          <Table.HeaderCell>Claimed</Table.HeaderCell>
          <Table.HeaderCell>Released</Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('date')} sorted={column == 'date' ? direction : undefined}>Time</Table.HeaderCell>
          <Table.HeaderCell className='sortable' onClick={() => sort('score')} sorted={column == 'score' ? direction : undefined}>Score</Table.HeaderCell>
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
                <input
                  type='checkbox'
                  checked={submission.checked}
                  id={submission.sid}
                  onChange={handleChange} />
              </Table.Cell>
              <Table.Cell>
                <Link to={`/${user?.role}/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
              </Table.Cell>
              <Table.Cell><Link to={`/${user?.role}/problems/${submission.pid}`}>{submission.problem?.name} </Link></Table.Cell>
              <Table.Cell><Link to={`/${user?.role}/teams`}>{submission.team.display_name}</Link></Table.Cell>
              <Table.Cell>{submission.language}</Table.Cell>
              <Table.Cell><span className={`status icn ${submission.status}`} /></Table.Cell>
              <Table.Cell>
                {submission.claimed ?
                  (submission.claimed?.uid === user?.uid ?
                    <Button content="Unclaim" icon={'hand paper'} onClick={() => unclaim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} /> :
                    <Button content="Claimed" icon={'lock'} disabled={true} labelPosition={'left'} />
                  ) :
                  <Button content="Claim" icon={'hand rock'} onClick={() => claim(submission.sid)} loading={isClaiming[submission.sid]} disabled={isClaiming[submission.sid]} labelPosition={'left'} />}
              </Table.Cell>
              <Table.Cell>{submission.released ? <Label color='green' icon='check' content="Released" /> : <Label icon='lock' content="Held" />}</Table.Cell>
              <Table.Cell><Moment fromNow date={submission.date * 1000} /> </Table.Cell>
              <Table.Cell>{submission.score}</Table.Cell>
            </Table.Row>)}
      </Table.Body>
    </Table>
  </>
}

export default Submissions