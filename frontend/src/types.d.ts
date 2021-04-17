declare module "abacus" {
  export interface Settings {
    competition_name: string;
    practice_name: string;
    points_per_yes: number;
    points_per_no: number;
    points_per_compilation_error: number;
    points_per_minute: number;
    start_date: Date;
    end_date: Date;
    practice_start_date: Date;
    practice_end_date: Date;
  }
  export interface Submission {
    sid: string;
    sub_no: number;
    date: number;
    division: string;
    language: string;
    released: boolean;
    claimed?: User;
    tid: string;
    team?: Team;
    pid: string;
    problem: Problem;
    status: string;
    score: number;
    feedback?: string;
    claimed?: User;
    flagged?: User;
    viewed?: boolean;
    //Blue
    runtime?: number;
    md5?: string;
    filename?: string;
    filesize?: number;
    source?: string;
    tests?: Test[];
    //Gold
    project_id?: number;
    design_document?: string;
  }
  export interface Problem {
    pid: string;
    practice?: boolean;
    id: string;
    division: string;
    name: string;
    description: string;
    //Blue
    cpu_time_limit?: number;
    memory_limit?: number;
    tests?: Test[];
    skeletons?: Skeleton[];
    solutions?: Solution[];
    //Gold
    project_id?: string;
    design_document?: boolean;
    max_points?: number;
    capped_points?: boolean;
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
    disabled?: boolean;
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