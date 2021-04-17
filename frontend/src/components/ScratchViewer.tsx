import React, { useEffect, useState } from 'react';
import config from 'environment'
import { Grid, Header, Icon, Label, Segment } from 'semantic-ui-react';
import Moment from 'react-moment';
import "./ScratchViewer.scss"

interface ScratchViewerProps {
  project_id?: string;
  content?: JSX.Element;
}

interface ScratchProject {
  title: string,
  description: string,
  public: boolean,
  visibility: string,
  is_published: boolean,
  author: {
    username: string
  },
  history: {
    created: string,
    modified: string,
    shared: string
  }
}

const ScratchViewer = ({ project_id, content = <></> }: ScratchViewerProps): JSX.Element => {
  const [project, setProject] = useState<ScratchProject>()

  useEffect(() => {
    fetch(`${config.API_URL}/scratch/project?project_id=${project_id}`)
      .then(res => res.json())
      .then(data => setProject(data))
      .catch(() => setProject(undefined))
  }, [project_id])

  if (project_id == undefined) return <></>

  if (!project) {
    return <Segment placeholder>
      <Header icon>
        <Icon name='search' />
        <p>We can not find a project with that id.</p>
        <p>Please make sure your project is public and published.</p>
      </Header>
    </Segment>
  }

  return <Grid columns={2} stackable>
    <Grid.Row>
      <Grid.Column textAlign='center'>
        <iframe src={`https://scratch.mit.edu/projects/${project_id}/embed`} width="485" height="402" frameBorder="0" scrolling="no" allowFullScreen />
      </Grid.Column>

      <Grid.Column>
        {project ? <Segment className='scratch-info'>
          <div>
            <a target='_blank' rel='noreferrer' href={`https://scratch.mit.edu/projects/${project_id}`}><h2>{project.title}</h2> {project.author.username}</a>
            <p>{project.description}</p>

            <div className='history'>
              <span>Created<br /> <Label><Moment fromNow date={Date.parse(project.history.created)} /></Label></span>
              <span>Modified<br /> <Label><Moment fromNow date={Date.parse(project.history.modified)} /></Label></span>
              <span>Shared<br /> <Label><Moment fromNow date={Date.parse(project.history.shared)} /></Label></span>
            </div>
          </div>
        </Segment> : <></>}
        {content}
      </Grid.Column>
    </Grid.Row>
  </Grid >
}

export default ScratchViewer