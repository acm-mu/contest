import { Problem, Submission } from 'abacus'
import React, { ChangeEvent, useState, useEffect, useMemo } from 'react'
import { Table, Button, Menu, MenuItemProps } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import config from 'environment'
import { Block, DivisionLabel, PageLoading } from 'components'
import { Helmet } from 'react-helmet'

interface ProblemItem extends Problem {
  checked: boolean
}
type SortKey = 'id' | 'name'
type SortConfig = {
  column: SortKey
  direction: 'ascending' | 'descending'
}

const Problems = (): JSX.Element => {
  const [isLoading, setLoading] = useState(true)
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [submissions, setSubmissions] = useState<{ [key: string]: Submission[] }>()
  const [isMounted, setMounted] = useState(true)
  const [isDeleting, setDeleting] = useState(false)
  const [activeDivision, setActiveDivision] = useState('blue')
  const activeProblems = useMemo(() => problems.filter(problem => problem.division == activeDivision), [problems, activeDivision])

  const [{ column, direction }, setSortConfig] = useState<SortConfig>({
    column: 'id',
    direction: 'ascending'
  })

  const sort = (newColumn: SortKey, problem_list: ProblemItem[] = problems) => {
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
    let response = await fetch(`${config.API_URL}/problems?columns=tests`, {
      headers: {
        authorization: `Bearer ${localStorage.accessToken}`
      }
    })

    if (response.ok) {
      const problems = Object.values(await response.json()) as ProblemItem[]

      if (!isMounted) return

      sort('id', problems.map(problem => ({ ...problem, checked: false })))

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

  const downloadProblems = async () => {
    const response = await fetch(`${config.API_URL}/problems?columns=description,design_document,project_id,skeletons,solutions,tests`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })
    if (response.ok) {
      const sanitized = JSON.stringify(Object.values(await response.json()), null, '\t')
      saveAs(new File([sanitized], 'problems.json', { type: 'text/json;charset=utf-8' }))
    }
  }

  const handleChange = ({ target: { id, checked } }: ChangeEvent<HTMLInputElement>) =>
    setProblems(problems.map(problem => problem.pid == id ? { ...problem, checked } : problem))

  const checkAll = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) =>
    setProblems(problems.map(problem => problem.division == activeDivision ? ({ ...problem, checked }) : problem))

  const deleteSelected = async () => {
    setDeleting(true)
    const problemsToDelete = activeProblems.filter(problem => problem.checked).map(problem => problem.pid)
    const response = await fetch(`${config.API_URL}/problems`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify({ pid: problemsToDelete })
    })
    if (response.ok) {
      setProblems(problems.filter(problem => !problemsToDelete.includes(problem.pid)))
    }
    setDeleting(false)
  }

  const handleItemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, { name }: MenuItemProps) =>
    name && setActiveDivision(name)

  if (isLoading) return <PageLoading />

  return <>
    <Helmet> <title>Abacus | Admin Problems</title> </Helmet>

    <Button as={Link} to='/admin/problems/new' primary content="Add Problem" />
    <Link to='/admin/problems/upload'><Button content="Upload Problems" /></Link>
    <Button content="Download Problems" onClick={downloadProblems} />
    {problems.filter(problem => problem.division == activeDivision && problem.checked).length ?
      <Button content="Delete Selected" negative onClick={deleteSelected} loading={isDeleting} disabled={isDeleting} /> : <></>}

    <Block size='xs-12' transparent>
      <Menu pointing secondary>
        <Menu.Item name='blue' active={activeDivision == 'blue'} onClick={handleItemClick}>Blue</Menu.Item>
        <Menu.Item name='gold' active={activeDivision == 'gold'} onClick={handleItemClick}>Gold</Menu.Item>
        <Menu.Item name='eagle' active={activeDivision == 'eagle'} onClick={handleItemClick}>Eagle</Menu.Item>
      </Menu>
      <Table sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell collapsing>
              <input
                type='checkbox'
                checked={activeProblems.length > 0 && activeProblems.filter((problem) => !problem.checked).length == 0}
                onChange={checkAll} />
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'id' ? direction : undefined}
              onClick={() => sort('id')}
              content="ID" />
            <Table.HeaderCell>Division</Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'name' ? direction : undefined}
              onClick={() => sort('name')}
              content="Problem Name" />
            <Table.HeaderCell>{activeDivision == 'blue' ? "# of Tests" : "Max Points"}</Table.HeaderCell>
            <Table.HeaderCell>Solved Attempts</Table.HeaderCell>
            <Table.HeaderCell>Total Attempts</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {problems.length == 0 ?
            <Table.Row>
              <Table.Cell colSpan={'100%'} style={{ textAlign: "center" }}>No Problems</Table.Cell>
            </Table.Row> :
            (activeProblems.map((problem: ProblemItem, index: number) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <input
                    type='checkbox'
                    checked={problem.checked}
                    id={problem.pid}
                    onChange={handleChange} />
                </Table.Cell>
                <Table.Cell><Link to={`/admin/problems/${problem.pid}`}>{problem.id}</Link></Table.Cell>
                <Table.Cell><DivisionLabel division={problem.division} /></Table.Cell>
                <Table.Cell><Link to={`/admin/problems/${problem.pid}`}>{problem.name}</Link></Table.Cell>
                <Table.Cell>{activeDivision == 'blue' ? problem.tests?.length : problem.max_points}</Table.Cell>
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