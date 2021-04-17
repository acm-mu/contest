import { Submission } from 'abacus';
import React from 'react';
import { BlueSubmission, GoldSubmission } from '.';
import SubmissionContext from './SubmissionContext';

interface SubmissionProps {
  submission: Submission;
  setSubmission?: React.Dispatch<React.SetStateAction<Submission | undefined>>;
  rerunning?: boolean;
}

const SubmissionView = ({ submission, setSubmission, rerunning }: SubmissionProps): JSX.Element =>
  <SubmissionContext.Provider value={{ submission, setSubmission, rerunning }}>
    {submission.division == 'blue' && <BlueSubmission />}
    {submission.division == 'gold' && <GoldSubmission />}
  </SubmissionContext.Provider>

export default SubmissionView