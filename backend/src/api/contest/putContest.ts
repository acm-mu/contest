import { Settings } from 'abacus'
import { Request, Response } from 'express'
import { matchedData, ParamSchema, validationResult } from "express-validator"
import contest from '../../abacus/contest'

export const schema: Record<string, ParamSchema> = {
  competition_name: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String competition_name is not supplied'
  },
  practice_name: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String practice_name is not supplied'
  },
  points_per_yes: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number points_per_yes is not supplied'
  },
  points_per_no: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number points_per_no is not supplied'
  },
  points_per_minute: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number points_per_minute is not supplied'
  },
  start_date: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number start_date is not supplied'
  },
  end_date: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number end_date is not supplied'
  },
  practice_start_date: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number practice_start_date is not supplied'
  },
  practice_end_date: {
    in: 'body',
    notEmpty: true,
    isNumeric: true,
    errorMessage: 'Number practice_end_date is not supplied'
  }
}

export const putContest = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({
      message: errors[0].msg
    })
    return
  }

  const settings = matchedData(req) as Settings

  const startDate = new Date(settings.start_date * 1000)
  const endDate = new Date(settings.end_date * 1000)

  if (endDate <= startDate) {
    res.status(400).send({ message: "End date cannot be before start date!" })
    return
  }

  const practiceStartDate = new Date(settings.practice_start_date * 1000)
  const practiceEndDate = new Date(settings.practice_end_date * 1000)

  if (practiceEndDate <= practiceStartDate) {
    res.status(400).send({ message: "Practice end date cannot be before start date!" })
    return
  }

  try {
    await contest.save_settings(settings)
    res.send(settings)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}