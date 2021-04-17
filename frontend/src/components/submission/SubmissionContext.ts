import { Submission } from "abacus"
import React, { createContext } from "react"

interface SubmissionContextType {
  submission: Submission | undefined
  setSubmission?: React.Dispatch<React.SetStateAction<Submission | undefined>>;
  rerunning?: boolean
}

const SubmissionContext = createContext<SubmissionContextType>({
  submission: undefined,
})

export default SubmissionContext