import { Problem } from "abacus";

export interface ProblemStateProps {
  problem?: Problem;
  setProblem?: React.Dispatch<React.SetStateAction<Problem>>
}

export { default as ProblemEditor } from './ProblemEditor'