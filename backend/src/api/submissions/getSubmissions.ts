import { Test } from 'abacus'
import { Request, Response } from 'express'
import { matchedData, ParamSchema, validationResult } from "express-validator"
import contest, { transpose } from '../../abacus/contest'

export const schema: Record<string, ParamSchema> = {
  sid: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'sid is invalid'
  },
  division: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'division is invalid'
  },
  language: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'language is invalid'
  },
  pid: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'pid is invalid'
  },
  status: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'status is invalid'
  },
  sub_no: {
    in: ['query', 'body'],
    isNumeric: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'sub_no is invalid'
  },
  tid: {
    in: ['query', 'body'],
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'tid is invalid'
  },
  released: {
    in: ['query', 'body'],
    isBoolean: true,
    notEmpty: true,
    optional: true
  }
}

export const getSubmissions = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }
  const problems = transpose(await contest.scanItems('problem', { columns: ['pid', 'division', 'id', 'name'] }), 'pid')
  const users = transpose(await contest.scanItems('user'), 'uid')

  try {
    const item = matchedData(req)

    if (req?.user?.role == 'judge') {
      item.division = req.user.division
    } else if (req?.user?.role == 'team') {
      item.tid = req.user.uid
    }

    const submissions = await contest.scanItems('submission', { args: item })

    submissions?.map((submission: any) => {
      submission.problem = problems[submission.pid]
      const team = users[submission.tid]
      submission.team = {
        uid: team?.uid,
        username: team?.username,
        display_name: team?.display_name,
        division: team?.division
      }
      if (submission.claimed !== undefined) {
        const claimee = users[submission.claimed]
        submission.claimed = {
          uid: claimee?.uid,
          username: claimee?.username,
          display_name: claimee?.display_name,
          division: claimee?.division
        }
      }
      if (req.user?.role == 'team' && !submission.released) {
        submission.status = 'pending'
        submission.score = 0
        submission.tests = submission.tests?.map((test: Test) => ({ ...test, result: '' }))
      }
      return submission
    })

    res.send(transpose(submissions, 'sid'))
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}
