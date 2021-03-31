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
    project_id?: string;
    language: string;
    md5: string;
    pid: string;
    runtime: number;
    released: boolean;
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
    tests: Test[];
  }
  export interface User {
    uid: string;
    role: string;
    username: string;
    password: string;
    display_name: string;
    division?: string;
    school?: string;
  }
  export interface Test {
    in: string;
    out: string;
    result: string;
  }
  export interface Skeleton {
    language: string;
    source: string;
    file_name: string;
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

  export interface Clarification {
    cid: string;
    body: string;
    uid: string;
    date: number;
    open?: boolean;
    parent?: string;
    division?: string;
    type?: string;
    title?: string;
  }

  export interface Context {
    type: 'pid' | 'cid' | 'sid';
    id: string;
  }

  export interface Notification {
    header?: string;
    to: string;
    content: string;
    id?: string;
    type?: 'success' | 'warning' | 'error';
    context?: Context;
  }

  export interface Args { [key: string]: unknown }
}