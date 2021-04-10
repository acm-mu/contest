import { Submission } from 'abacus';
import React from 'react';
import { BlueSubmission, GoldSubmission } from '.';
import SubmissionContext from './SubmissionContext';

interface SubmissionProps {
  submission: Submission;
  rerunning?: boolean
}

const SubmissionView = ({ submission, rerunning }: SubmissionProps): JSX.Element =>
  <SubmissionContext.Provider value={{ submission, rerunning }}>
    {submission.division == 'blue' && <BlueSubmission />}
    {submission.division == 'gold' && <GoldSubmission />}
  </SubmissionContext.Provider>

export default SubmissionView