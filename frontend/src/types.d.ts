declare module "abacus" {
  export interface Settings {
    competition_name: string;
    points_per_yes: number;
    points_per_no: number;
    points_per_compilation_error: number;
    points_per_minute: number;
    start_date: Date;
    end_date: Date;
  }
  export interface Submission {
    sid: string;
    date: number;
    division: string;
    filename?: string;
    filesize?: number;
    source: string;
    project_id?: number;
    design_document?: string;
    language: string;
    md5: string;
    pid: string;
    problem: Problem;
    runtime?: number;
    released: boolean;
    score: number;
    status: string;
    sub_no: number;
    tid: string;
    team?: Team;
    tests?: Test[];
    claimed?: User;
  }
  export interface Problem {
    pid: string;
    id: string;
    division: string;
    name: string;
    description: string;
    cpu_time_limit?: number;
    memory_limit?: number;
    tests?: Test[];
    project_id?: string;
    design_document?: boolean;
    skeletons?: Skeleton[];
    solutions?: Solution[];
  }
  export interface User {
    uid: string;
    role: string;
    username: string;
    disabled?: boolean;
    password: string;
    display_name: string;
    division?: string;
    school?: string;
  }
  export interface Test {
    in: string;
    out: string;
    stdout?: string;
    result?: string;
    include?: boolean;
  }
  export interface Skeleton {
    language: string;
    source: string;
    file_name: string;
  }
  export interface Solution {
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

  export interface Context {
    type: 'pid' | 'cid' | 'sid';
    id: string;
  }

  export interface Clarification {
    cid: string;
    body: string;
    user: User;
    date: number;
    parent?: string;
    division?: string;
    type?: string;
    title?: string;
    children: Clarification[];
    open?: boolean;
    context?: Context;
  }

  export interface Notification {
    header?: string;
    to?: string;
    content: string;
    id: string;
    context?: Context;
    type?: 'success' | 'warning' | 'error';
  }

  export interface Args { [key: string]: unknown }
}