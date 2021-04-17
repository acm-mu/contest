import React from 'react';
import { Message } from 'semantic-ui-react';

export type StatusMessageType = {
  type: 'error' | 'warning' | 'success' | undefined
  message: string
  icon?: string
  header?: string
}

interface StatusMessageProps {
  message?: StatusMessageType
  onDismiss?: () => void;
  style?: Record<string, string | number>
}

const StatusMessage = ({ message: msg, style, onDismiss }: StatusMessageProps): JSX.Element => {
  if (!msg) return <></>
  const { type, message, icon, header } = msg

  switch (type) {
    case 'success': return <Message style={style} success icon='check' header='Success!' content={message} onDismiss={onDismiss} />
    case 'error': return <Message style={style} error icon='exclamation' header='An error has occurred!' content={message} onDismiss={onDismiss} />
    case 'warning': return <Message style={style} warning icon='warning sign' header='Warning!' content={message} onDismiss={onDismiss} />
    default: return <Message style={style} icon={icon} header={header} content={message} onDismiss={onDismiss} />
  }
}

export default StatusMessage