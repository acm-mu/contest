import { Problem, Submission } from 'abacus'
import React, { useState, useEffect, useContext } from 'react'
import { Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import config from 'environment'
import { Block, PageLoading } from 'components'
import { Helmet } from 'react-helmet'
import { AppContext } from 'context'

type SortKey = 'id' | 'name'
type SortConfig = {
  column: SortKey
  direction: 'ascending' | 'descending'
}

const Problems = (): JSX.Element => {
  const [isLoading, setLoading] = useState(true)
  const [problems, setProblems] = useState<Problem[]>([])
  const [submissions, setSubmissions] = useState<{ [key: string]: Submission[] }>()
  const [isMounted, setMounted] = useState(true)
  const { user } = useContext(AppContext)

  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'id',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, problem_list: Problem[] = problems) => {
    const newDirection = column === newColumn && direction == 'ascending' ? 'descending' : 'ascending'
    setSortConfig({ column: newColumn, direction: newDirection })

    setProblems(problem_list.sort((p1: Problem, p2: Problem) =>
      (p1[newColumn] || 'ZZ').localeCompare(p2[newColumn] || 'ZZ') * (direction == 'ascending' ? 1 : -1
      )))
  }

  useEffect(() => {
    loadProblems()
    return () => { setMounted(false) }
  }, [])

  const loadProblems = async () => {
    let response = await fetch(`${config.API_URL}/problems?columns=tests&division=${user?.division}`, {
      headers: {
        authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (response.ok) {
      const problems = Object.values(await response.json()) as Problem[]

      if (!isMounted) return

      sort('id', problems)

      response = await fetch(`${config.API_URL}/submissions`, {
        headers: {
          authorization: `Bearer ${localStorage.accessToken}`
        }
      })

      if (!isMounted) return

      const submissions = Object.values(await response.json()) as Submission[]
      const subs: { [key: string]: Submission[] } = {}
      submissions.forEach((sub: Submission) => {
        const { pid } = sub;
        if (!(pid in subs)) subs[pid] = []
        subs[pid].push(sub)
      })
      setSubmissions(subs)
    } else {
      setProblems([])
      setSubmissions({})
    }
    setLoading(false)
  }

  if (isLoading) return <PageLoading />

  return <>
    <Helmet> <title>Abacus | Judge Problems</title> </Helmet>
    <Block size='xs-12' transparent>
      <Table sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              sorted={column === 'id' ? direction : undefined}
              onClick={() => sort('id')}
              content="ID" />
            <Table.HeaderCell
              sorted={column === 'name' ? direction : undefined}
              onClick={() => sort('name')}
              content="Problem Name" />
            <Table.HeaderCell># of Tests</Table.HeaderCell>
            <Table.HeaderCell>Solved Attempts</Table.HeaderCell>
            <Table.HeaderCell>Total Attempts</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {problems.length == 0 ?
            <Table.Row>
              <Table.Cell colSpan={'100%'} style={{ textAlign: "center" }}>No Problems</Table.Cell>
            </Table.Row> :
            (problems.map((problem: Problem, index: number) => (
              <Table.Row key={index}>
                <Table.Cell><Link to={`/judge/problems/${problem.pid}`}>{problem.id}</Link></Table.Cell>
                <Table.Cell><Link to={`/judge/problems/${problem.pid}`}>{problem.name}</Link></Table.Cell>
                <Table.Cell>{problem.tests?.length}</Table.Cell>
                {submissions && <>
                  <Table.Cell>{problem.pid in submissions ? submissions[problem.pid].filter((p) => p.score > 0).length : 0}</Table.Cell>
                  <Table.Cell>{problem.pid in submissions ? submissions[problem.pid].length : 0}</Table.Cell>
                </>}
              </Table.Row>
            )))}
        </Table.Body>
      </Table>
    </Block>
  </>
}

export default Problems