import { User } from "abacus";

// Convert's stored language values in to syntax highlighter friendly values
export const syntax_lang = (language: string): string => {
  switch (language) {
    case 'python3':
      return "python"
    default:
      return language
  }
}

export const userHome = (user: User): string => {
  switch (user?.role) {
    case 'admin':
      return '/admin'
    case 'team':
      return `/${user.division}`
    case 'judge':
      return `/judge`
    default:
      return '/'
  }
}

export const divisions = [
  { key: 1, text: "Blue", value: 'blue' },
  { key: 2, text: "Gold", value: 'gold' }
]

export const roles = [
  { key: 'team', text: 'Team', value: 'team' },
  { key: 'proctor', text: 'Proctor', value: 'proctor' },
  { key: 'judge', text: 'Judge', value: 'judge' },
  { key: 'admin', text: 'Admin', value: 'admin' }
]

export interface Language {
  key: string;
  value: string;
  text: string;
  file_extension: string;
}
export const languages: Language[] = [
  { key: 'python3', value: 'Python 3', text: 'Python 3', file_extension: '.py' },
  { key: 'java', value: 'Java', text: 'Java', file_extension: '.java' },
]

export const format_text = (str: string): string => str.replace(/(^.*$)/gm, (c: string) => isNaN(+c) ? `"${c}"` : c)

// Capitalizes the first letter of a string
export const capitalize = (str: string): string => str.trim().replace(/^\w/, (c) => c.toUpperCase());

// Capitalizes the first letter of every word in a string
export const capitalize_all = (str: string): string => str.trim().replace(/\w*/g, (word) => capitalize(word));

export const compare = (o1: string | number, o2: string | number): number => {
  if (typeof (o1) == 'string' && typeof (o2) == 'string')
    return o1.localeCompare(o2)
  else if (typeof (o1) == 'number' && typeof (o2) == 'number') {
    if (o1 == o2) return 0
    return o1 > o2 ? 1 : -1;
  }
  return 0
}