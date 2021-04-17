import { Block } from "components"
import React, { useContext } from "react"
import Moment from "react-moment"
import { Link } from "react-router-dom"
import { Dropdown, DropdownProps, Loader, Table } from "semantic-ui-react"
import { statuses, userHome } from "utils"
import { AppContext } from "context"
import SubmissionContext from "./SubmissionContext"


const SubmissionDetail = (): JSX.Element => {
  const { user, settings } = useContext(AppContext)
  const { rerunning, submission, setSubmission } = useContext(SubmissionContext)

  if (!user || !submission) return <></>

  const handleDropdownChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    if (setSubmission) {
      if (value && settings) {
        setSubmission({ ...submission, status: `${value}`, score: 0 })
      }
    }
  }

  const user_home = userHome(user)

  const showUser = submission.tid != user.uid

  const submission_link = <Table.Cell rowSpan={2}><Link to={`${user_home}/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link></Table.Cell>
  const submission_team = <Table.Cell>{submission.team.display_name}</Table.Cell>
  const submission_date = <Table.Cell><Moment fromNow date={submission.date * 1000} /></Table.Cell>
  const submission_problem = <Table.Cell><Link to={`${user_home}/problems/${user.role == 'admin' || user.role == 'judge' || user.role == 'proctor' ? submission.problem.pid : submission.problem.id}`}>{submission.problem.name}</Link></Table.Cell>

  const submission_status = <Table.Cell>{rerunning ? <Loader inline size='small' active /> :
    setSubmission ?
      <Dropdown value={submission.status} className={`icn ${submission.status}`} onChange={handleDropdownChange} options={statuses} /> :
      <span className={`icn status ${submission.status}`} />
  }
  </Table.Cell >

  if (submission.division == 'blue') {
    return <Block transparent size='xs-12'>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan={2}>ID</Table.HeaderCell>
            {showUser && <Table.HeaderCell>TEAM</Table.HeaderCell>}
            <Table.HeaderCell>DATE</Table.HeaderCell>
            <Table.HeaderCell>PROBLEM</Table.HeaderCell>
            <Table.HeaderCell>SUB NO</Table.HeaderCell>
            <Table.HeaderCell>STATUS</Table.HeaderCell>
            <Table.HeaderCell>CPU</Table.HeaderCell>
            <Table.HeaderCell>SCORE</Table.HeaderCell>
            <Table.HeaderCell>LANGUAGE</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell colSpan={8}>TEST CASES</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            {submission_link}
            {showUser && submission_team}
            {submission_date}
            {submission_problem}
            <Table.Cell>{submission.sub_no + 1}</Table.Cell>
            {submission_status}
            <Table.Cell>{rerunning ? <Loader active inline size='small' /> : Math.floor(submission.runtime || 0)}</Table.Cell>
            <Table.Cell>{rerunning ? <Loader active inline size='small' /> : submission.score}</Table.Cell>
            <Table.Cell>{submission.language}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell colSpan={8}>
              {rerunning ? <Loader inline size='small' active /> :
                submission.tests?.map(({ result }, index) => <span key={`test-${index}`} className={`result icn ${result}`} />)
              }
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Block>
  } else if (submission.division == 'gold') {
    return <Block transparent size='xs-12'>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan={2}>ID</Table.HeaderCell>
            {showUser && <Table.HeaderCell>TEAM</Table.HeaderCell>}
            <Table.HeaderCell>DATE</Table.HeaderCell>
            <Table.HeaderCell>PROBLEM</Table.HeaderCell>
            <Table.HeaderCell>STATUS</Table.HeaderCell>
            <Table.HeaderCell>SCORE</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            {submission_link}
            {showUser && submission_team}
            {submission_date}
            {submission_problem}
            {submission_status}
            <Table.Cell>{submission.score}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Block>
  }

  return <></>
}

export default SubmissionDetail