import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { Button, ButtonProps, Checkbox, CheckboxProps, Comment, Form, Grid, Header, Icon, Menu, MenuItemProps, Message, Popup, Segment } from 'semantic-ui-react';
import { Clarification } from 'abacus';
import config from '../environment'
import Moment from 'react-moment';
import './Clarifications.scss'
import { Block, PageLoading, Unauthorized } from 'components';
import { AppContext } from 'context';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ClarificationModal from 'components/ClarificationModal';

const Clarifications = (): JSX.Element => {
  const { user } = useContext(AppContext)
  const [isLoading, setLoading] = useState(true)
  const [clarifications, setClarifications] = useState<{ [key: string]: Clarification }>()
  const { cid } = useParams<{ cid: string }>()
  const [activeItem, setActiveItem] = useState<string>(cid || '')
  const [showClosed, setShowClosed] = useState(false)

  const helmet = <Helmet> <title>Abacus | Clarifications</title> </Helmet>

  const loadClarifications = async (): Promise<{ [key: string]: Clarification }> => {
    let clarifications = {}
    const response = await fetch(`${config.API_URL}/clarifications`, {
      headers: { Authorization: `Bearer ${localStorage.accessToken}` }
    })

    if (response.ok) {
      clarifications = await response.json()
    }

    setClarifications(clarifications)
    setLoading(false)

    return clarifications
  }

  useEffect(() => {
    loadClarifications()
  }, [])

  if (!user || user.role === 'proctor') return <Unauthorized />

  const ClarificationsMenu = ({ clarifications }: { clarifications: Clarification[] }) => {

    const onFilterChange = (_event: FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => setShowClosed(checked || false)
    const handleItemClick = (_e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, { name }: MenuItemProps) => name && setActiveItem(name)

    return <>
      <Checkbox toggle label='Show Closed' checked={showClosed} onChange={onFilterChange} />
      <Menu secondary vertical style={{ width: '100%' }}>
        {Object.values(clarifications)
          .filter((c1) => showClosed || c1.open)
          .sort((c1, c2) => c2.date - c1.date).map((clarification: Clarification) =>
            <Menu.Item
              name={clarification.cid}
              onClick={handleItemClick}
              key={clarification.cid}
              active={activeItem == clarification.cid}
              className={`${clarification.open ? 'open' : 'closed'}`}
            >
              <Header as='h5'>{clarification.title}
                {clarification.open ?
                  clarification.type == 'private' ?
                    <Popup content="Private" trigger={<Icon name='eye slash' />} /> :
                    <Popup content="Public" trigger={<Icon name='eye' />} /> :
                  <Icon name='lock' />
                }
              </Header>
              {user?.uid == clarification.user.uid ? "You" : clarification.user.display_name} {' '}
              <Moment fromNow date={clarification.date * 1000} />
            </Menu.Item>)}
      </Menu>
    </>
  }

  const ClarificationComment = ({ clarification }: { clarification: Clarification }) => {

    // Admins can delete any clarification, Judge's can delete their own
    const canDelete = user?.role == 'admin' || (user?.role == 'judge' && clarification.user.uid == user?.uid)

    const deleteClarification = () => {
      fetch(`${config.API_URL}/clarifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`,
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
        body: JSON.stringify({ cid: clarification.cid })
      }).then((response) => {
        if (response.ok) {
          loadClarifications()
        }
      })
    }

    return <Comment>
      <Comment.Content>
        <Comment.Author as='a'>{clarification.user.display_name}</Comment.Author>
        <Comment.Metadata>
          <div><Moment fromNow date={clarification.date * 1000} /></div>
          {canDelete && <a href='#' onClick={deleteClarification}>Delete</a>}
        </Comment.Metadata>
        <Comment.Text>{clarification.body}</Comment.Text>
      </Comment.Content>
    </Comment>
  }

  const ClarificationView = ({ clarification }: { clarification?: Clarification }) => {
    const [body, setBody] = useState('')
    const [replyLoading, setReplyLoading] = useState(false)

    const handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => setBody(value)

    const handleSubmit = async () => {
      setReplyLoading(true)
      const response = await fetch(`${config.API_URL}/clarifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          parent: activeItem, body
        })
      })

      if (response.ok) {
        await loadClarifications()
        setBody('')
      }
      setReplyLoading(false)
    }

    const handleLock = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, { value: open }: ButtonProps) => {
      const response = await fetch(`${config.API_URL}/clarifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.accessToken}`,
          'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify({ cid: activeItem, open })
      })
      if (response.ok) {
        loadClarifications()
      }
    }

    if (activeItem === '') return <p className='prompt'>No clarification selected. Pick a clarification to view.</p>

    if (!clarification) return <p className='prompt'>Clarification not found!</p>

    // Can only comment if open and user is judge, admin, or author
    const canComment = clarification.open && (user?.role !== 'team' || clarification.user.uid == user?.uid)

    return <>
      {user?.role == 'admin' || user?.role == 'judge' ?
        (clarification?.open ?
          <Popup trigger={<Button floated='right' icon='unlock' value={false} onClick={handleLock} />} content='Close Clarification' /> :
          <Popup trigger={<Button floated='right' icon='lock' value={true} onClick={handleLock} />} content='Reopen Clarification' />
        ) : <></>}

      <Comment.Group>
        <ClarificationComment clarification={clarification} />
        {clarification.children.length > 0 ?
          <Comment.Group>
            {clarification.children
              .sort(({ date: d1 }, { date: d2 }) => d1 - d2)
              .map((child) =>
                <ClarificationComment key={child.cid} clarification={child} />)}
          </Comment.Group> : <></>
        }
        {canComment ?
          <Form reply>
            <Form.TextArea name='body' value={body} onChange={handleChange} />
            <Button loading={replyLoading} disabled={replyLoading} content='Add Reply' labelPosition='left' icon='edit' primary onClick={handleSubmit} />
          </Form>
          : <Message
            warning
            icon='exclamation'
            header='Notice'
            content='Replying to this clarification is disabled.'
          />}
      </Comment.Group>
    </>
  }

  if (isLoading) return <PageLoading />

  const askClarification = <ClarificationModal trigger={<Button content="Ask Clarification" />} callback={({ cid }) => {
    loadClarifications()
    setActiveItem(cid)
  }} />

  if (!clarifications || Object.values(clarifications).length == 0)
    return <>
      {helmet}
      <Block size='xs-12' transparent>
        <h2>Clarifications</h2>
        {askClarification}
        <p>There are no active clarifications right now!</p>
      </Block>
    </>

  const clarification = Object.keys(clarifications).includes(activeItem) ? clarifications[activeItem] : undefined

  return <>
    {helmet}
    <Block size='xs-12' transparent>
      <h2>Clarifications</h2>
      {askClarification}
      <Segment>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column width={4}>
              <ClarificationsMenu clarifications={Object.values(clarifications)} />
            </Grid.Column>
            <Grid.Column width={12}>
              <ClarificationView clarification={clarification} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Block>
  </>
}

export default Clarifications