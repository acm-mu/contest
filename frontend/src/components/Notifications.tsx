import { Context, Notification } from 'abacus';
import React, { useContext, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Message } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { userHome } from 'utils';
import { SocketContext, AppContext } from 'context';
import './Notifications.scss';

declare global {
  interface Window {
    notifications: Notification[]
    sendNotification: (notification: Notification) => void;
  }
}

const Notifications = (): JSX.Element => {
  const [notifications, setNotifications] = useState<Notification[]>(window.notifications || [])
  const { user } = useContext(AppContext)
  const socket = useContext(SocketContext)

  window.sendNotification = (notification: Notification) => {
    if (!notification.id) notification.id = uuidv4()
    setNotifications(notifications =>
      notifications.concat(notification))

    setTimeout(() => {
      setNotifications(notifications =>
        notifications.filter(({ id }) => id != notification.id))
    }, 15 * 1000)

  }

  useEffect(() => {
    socket?.on('notification', (notification: Notification) => {
      if (forMe(notification)) window.sendNotification(notification)
    })
  }, [user])

  const forMe = ({ to }: Notification) => {
    if (!to || to == 'public') return true
    for (const query of to.split('&')) {
      const [type, id] = query.split(':')
      if (type == 'uid' && user?.uid !== id) return false
      if (type == 'role' && user?.role !== id) return false
      if (type == 'division' && id !== 'public' && user?.division !== id) return false
    }
    return true
  }

  const typeIcon = (type?: string) => {
    switch (type) {
      case 'success': return 'check'
      case 'warning': return 'warning sign'
      case 'error': return 'exclamation'
      default: return 'bell'
    }
  }

  const contextLink = (context?: Context): string => {
    if (!context || !user) return ''
    switch (context.type) {
      case 'cid': return `${userHome(user)}/clarifications/${context.id}`
      case 'pid': return `${userHome(user)}/problems/${context.id}`
      case 'sid': return `${userHome(user)}/submissions/${context.id}`
    }
  }

  return <TransitionGroup className='notifications'>
    {notifications.map(({ id, type, header, content, context }) =>
      <CSSTransition
        unmountOnExit
        key={id}
        timeout={500}
        className='notification'
      >
        <Message
          as={Link}
          to={contextLink(context)}
          icon={typeIcon(type)}
          success={type === 'success'}
          warning={type === 'warning'}
          error={type === 'error'}
          header={header}
          content={content}
          onDismiss={() => setNotifications(notifications =>
            notifications.filter(notification => id != notification.id))}
        />
      </CSSTransition>
    )}
  </TransitionGroup>
}

export default Notifications