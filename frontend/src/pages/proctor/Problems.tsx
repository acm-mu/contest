import { Problem } from 'abacus'
import React, { useState, useEffect } from 'react'
import { Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import config from 'environment'
import { Block, PageLoading } from 'components'
import { Helmet } from 'react-helmet'

type SortKey = 'id' | 'name'
type SortConfig = {
  column: SortKey
  direction: 'ascending' | 'descending'
}

const Problems = (): JSX.Element => {
  const [isLoading, setLoading] = useState(true)
  const [problems, setProblems] = useState<Problem[]>([])
  const [isMounted, setMounted] = useState(true)

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
    const response = await fetch(`${config.API_URL}/problems?columns=tests&division=blue`, {
      headers: {
        authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (response.ok) {
      const problems = Object.values(await response.json()) as Problem[]

      if (!isMounted) return

      sort('id', problems)

    } else {
      setProblems([])
    }
    setLoading(false)
  }

  if (isLoading) return <PageLoading />

  return <>
    <Helmet> <title>Abacus | Proctor Problems</title> </Helmet>
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
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {problems.length == 0 ?
            <Table.Row>
              <Table.Cell colSpan={'100%'} style={{ textAlign: "center" }}>No Problems</Table.Cell>
            </Table.Row> :
            (problems.map((problem: Problem, index: number) => (
              <Table.Row key={index}>
                <Table.Cell><Link to={`/proctor/problems/${problem.pid}`}>{problem.id}</Link></Table.Cell>
                <Table.Cell><Link to={`/proctor/problems/${problem.pid}`}>{problem.name}</Link></Table.Cell>
                <Table.Cell>{problem.tests?.length}</Table.Cell>
              </Table.Row>
            )))}
        </Table.Body>
      </Table>
    </Block>
  </>
}

export default Problems