
import { Submission } from 'abacus'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { PieChart } from '@toast-ui/react-chart'
import { AppContext, SocketContext } from 'context'
import { Block, PageLoading } from 'components'
import config from 'environment'
import '@toast-ui/chart/dist/toastui-chart.min.css'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const Home = (): JSX.Element => {
  const socket = useContext(SocketContext)
  const [isLoading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>()
  const [isMounted, setMounted] = useState(true)

  const { user, settings } = useContext(AppContext)

  const loadSubmissions = async () => {
    const getSubmissions = await fetch(`${config.API_URL}/submissions`, { headers: { Authorization: `Bearer ${localStorage.accessToken}` } })

    if (!isMounted) return

    const subs: Submission[] = Object.values(await getSubmissions.json())
    setSubmissions(subs.filter(({ team, date }) => !team.disabled && date * 1000 > Number(settings?.start_date) && date * 1000 < Number(settings?.end_date)))
    setLoading(false)
  }

  useEffect(() => {
    loadSubmissions().then(() => setLoading(false))
    socket?.on('new_submission', loadSubmissions)
    socket?.on('update_submission', loadSubmissions)
    socket?.on('delete_submission', loadSubmissions)
    return () => setMounted(false)
  }, []);

  const flaggedSubmissions = useMemo(() => submissions?.filter(({ flagged }) => flagged !== undefined), [submissions])

  const breakdownData = useMemo(() => {
    const statuses: { [key: string]: { name: string, data: number } } = {};

    if (submissions) {
      for (const { status } of submissions) {
        if (statuses[status] == undefined)
          statuses[status] = { name: status, data: 1 }
        else
          statuses[status].data++
      }
    }

    return {
      categories: ['Submission Status'],
      series: Object.values(statuses)
    }
  }, [submissions])

  const categories: string[] = []
  if (settings?.start_date && settings?.end_date) {
    for (let time = Number(settings?.start_date); time <= Number(settings?.end_date); time += 1800000) {
      categories.push(moment(time).format('hh:mm a'))
    }
  }

  const breakdownOptions = {
    theme: {
      series: {
        colors: ['#83cd64', '#db2828', '#cccccc', '#aaaaaa']
      }
    },
    chart: {
      width: 'vw',
      height: 450,
      animation: true
    },
    series: {
      selectable: true,
      clockwise: true,
      dataLabels: {
        visible: true,
        anchor: 'outer',
      }
    },
    legend: {
      align: 'bottom',
    }
  };

  if (isLoading) return <PageLoading />

  return <>
    <Helmet> <title>Abacus | Admin</title> </Helmet>
    <Block size='xs-12'>
      <h1>Admin Dashboard</h1>
    </Block>

    <Block size='xs-6'>
      <h1>Submission Breakdown</h1>
      {submissions?.length ?

        <PieChart
          data={breakdownData}
          options={breakdownOptions}
        />
        : <p>There are not any submissions yet!</p>}
    </Block>

    <Block size='xs-6'>
      <h1>Flagged Submissions</h1>
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
          {flaggedSubmissions && flaggedSubmissions.length > 0 ?
            flaggedSubmissions.map(submission =>
              <Table.Row key={`flagged-${submission.sid}`}>
                <Table.Cell>
                  <Link to={`/${user?.role}/submissions/${submission.sid}`}>{submission.sid.substring(0, 7)}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/${user?.role}/teams/${submission.tid}`}>{submission.team.display_name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/${user?.role}/problems/${submission.pid}`}>{submission.problem.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {submission.language}
                </Table.Cell>
              </Table.Row>
            ) :
            <Table.Row>
              <Table.Cell colSpan={'100%'}>There are no flagged submissions.</Table.Cell>
            </Table.Row>
          }
        </Table.Body>
      </Table>
    </Block>
  </>
}
export default Home