import React, { useContext, useEffect, useState } from "react";
import Moment from "react-moment";
import { Loader, Table } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Block, Countdown, Unauthorized } from "../../components";
import { ProblemType, SubmissionType } from "../../types";
import config from '../../environment'
import "../../components/Icons.scss";
import { UserContext } from "../../context/user";
import { useAuth } from "../../authlib";

const Submissions = (): JSX.Element => {
  const { user } = useContext(UserContext);
  const [isAuthenticated] = useAuth(user)
  const [isLoading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState<{ [key: string]: ProblemType }>({})

  useEffect(() => {
    if (isAuthenticated) {
      const filter = (user && !['judge', 'admin'].includes(user.role)) ? `&team_id=${user.user_id}` : ''

      fetch(`${config.API_URL}/submissions?division=blue${filter}`)
        .then(res => res.json())
        .then((subs) => {
          setLoading(false)
          setSubmissions(Object.values(subs))
        });

      fetch(`${config.API_URL}/problems?division=blue`)
        .then(res => res.json())
        .then((probs) => {
          console.log(probs)
          setProblems(probs)
        })
    }
  }, [isAuthenticated]);

  return (
    <>
      {isAuthenticated ?
        <>
          <Countdown />
          <Block transparent size="xs-12">
            {isLoading ?
              <Loader active inline='centered' content="Loading" /> :
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Submission ID</Table.HeaderCell>
                    <Table.HeaderCell>Problem</Table.HeaderCell>
                    <Table.HeaderCell>Submission #</Table.HeaderCell>
                    <Table.HeaderCell>Language</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {submissions.length == 0 ?
                    (<Table.Row>
                      <Table.Cell colSpan={7} style={{ textAlign: "center" }}>
                        No Submissions
                    </Table.Cell>
                    </Table.Row>)
                    : (submissions.map((submission: SubmissionType, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          <Link to={`/blue/submissions/${submission.submission_id}`}>
                            {submission.submission_id.substring(0, 7)}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <Link to={`/blue/problems/${submission.problem_id}`}>
                            {problems[submission.problem_id]?.problem_name}
                          </Link>
                        </Table.Cell>
                        <Table.Cell> {submission.sub_no + 1} </Table.Cell>
                        <Table.Cell> {submission.language} </Table.Cell>
                        <Table.Cell>
                          <span className={`status icn ${submission.status}`} />
                        </Table.Cell>
                        <Table.Cell>
                          <Moment fromNow>{submission.date * 1000}</Moment>
                        </Table.Cell>
                        <Table.Cell> {submission.score} </Table.Cell>
                      </Table.Row>
                    )))}
                </Table.Body>
              </Table>}
          </Block>
        </> :
        <Unauthorized />}
    </>
  );
};

export default Submissions;
