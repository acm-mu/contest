import React, { useContext } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Block, ScratchViewer } from 'components';
import SubmissionContext from './SubmissionContext';
import SubmissionDetail from './SubmissionDetail';
import "./Submission.scss"
import { Form, Header, Rating, RatingProps, Segment, TextArea } from 'semantic-ui-react';
import { AppContext } from 'context';

const GoldFeedback = (): JSX.Element => {
  const { user } = useContext(AppContext);
  const { submission, setSubmission } = useContext(SubmissionContext);

  const handleScore = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, { rating: score }: RatingProps) => {
    if (!submission || !setSubmission) return
    if (score && typeof score == 'number')
      setSubmission({ ...submission, score })
  }

  const handleChange = ({ target: { value: feedback } }: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!submission || !setSubmission) return
    setSubmission({ ...submission, feedback })
  }

  if (!submission?.released) {
    if (user?.role != 'judge' && user?.role != 'admin') {
      return <Segment placeholder style={{ alignItems: 'center' }}>
        <Header size='huge'>Pending Judgement!</Header>
      </Segment>
    }
  }

  return <Segment>
    <Form>
      <h2>Scorecard</h2>

      <div className="field">
        <label>Score</label>
        <Rating icon='star' disabled={!setSubmission} rating={submission?.score} maxRating={submission?.problem.max_points || 5} size='massive' onRate={handleScore} />
      </div>

      {setSubmission ?
        <Form.Field label='Feedback' control={TextArea} value={submission?.feedback} onChange={handleChange} /> :
        <>
          <label>Feedback</label>
          <p>{submission?.feedback}</p>
        </>
      }
    </Form>
  </Segment>
}

const GoldSubmission = (): JSX.Element => {
  const { submission } = useContext(SubmissionContext)

  return <>
    <SubmissionDetail />
    {submission?.project_id ?
      <Block center transparent size='xs-12'>
        <ScratchViewer project_id={`${submission.project_id}`} content={<GoldFeedback />} />
      </Block> : <></>
    }
    {submission?.design_document ?
      <Block size='xs-12'>
        <h2>Design Document</h2>
        <MDEditor.Markdown source={submission?.design_document || ''} />
      </Block> : <></>}
  </>
}
export default GoldSubmission