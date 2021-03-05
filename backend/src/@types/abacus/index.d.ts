declare module "abacus" {
  export interface Settings {
    competition_name: string;
    points_per_yes: number;
    points_per_no: number;
    points_per_compilation_error: number;
    points_per_minute: number;
    start_date: number;
    end_date: number
  }
  export interface Submission {
    sid: string;
    date: number;
    filename: string;
    filesize: number;
    source: string;
    language: string;
    md5: string;
    pid: string;
    runtime: number;
    score: number;
    status: string;
    sub_no: number;
    tid: string;
    tests: Test[];
  }
  export interface Problem {
    pid: string;
    id: string;
    division: string;
    name: string;
    description: string;
    cpu_time_limit: number;
    memory_limit: number;
    skeletons?: Skeleton[];
  }
  export interface User {
    uid: string;
    role: string;
    username: string;
    password: string;
    display_name: string;
    division?: string;
    school?: string;
    scratch_username?: string;
  }
  export interface Test {
    in: string;
    out: string;
    result: string;
  }
  export interface Skeleton {
    language: string;
    source: string;
  }
  export interface ProblemScore {
    num_submissions: number;
    problem_score: number;
    solved: boolean;
    submissions: Submission[];
  }
  export interface StandingsUser {
    display_name: string;
    uid: string;
    username: string;
    solved: number;
    time: number;
    problems: { [key: string]: ProblemScore };
  }

  export interface Args { [key: string]: unknown }
}