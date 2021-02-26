type TestType = {
  in: string;
  out: string;
  stdout?: string;
  include: boolean;
  result?: string;

}

type SkeletonType = {
  source: string;
  language: string;
}

type SubmissionType = {
  date: number;
  filename: string;
  filesize: number;
  language: string;
  md5: string;
  problem: ProblemType;
  problem_id: string;
  runtime: number;
  score: number;
  source: string;
  status: string;
  sub_no: number;
  sid: string;
  team: UserType;
  team_id: string;
  tests: TestType[];
}

type ProblemScoreType = {
  num_submissions: number;
  problem_score: number;
  solved: boolean;
  submissions: SubmissionType[];
}

type ProblemType = {
  pid: string;
  id: string;
  division: string;
  name: string;
  description: string;
  cpu_time_limit: number;
  memory_limit: number;
  tests: TestType[];
  skeletons: SkeletonType[]
}

type UserType = {
  uid: string;
  role: string;
  username: string;
  password: string;
  display_name: string;
  division: string;
  school?: string;
  scratch_username?: string;
  session_token: string;
}

type StandingsUser = {
  uid: string;
  role: string;
  username: string;
  display_name: string;
  division: string;
  scratch_username?: string;
  solved: number;
  time: number;
  problems: [ProblemScoreType];
}

type ClarificationType = {
  clarification_id: string;
  title: string;
  text: string;
  team_id: string;
  date: number;
  parent: string;
}

type CompetitionSettings = {
  competition_name: string;
  points_per_yes: number;
  points_per_no: number;
  points_per_compilation_error: number;
  points_per_minute: number;
  start_date: Date;
  end_date: Date
}

export type { StandingsUser, TestType, SubmissionType, ProblemType, UserType, ProblemScoreType, CompetitionSettings, ClarificationType, SkeletonType }