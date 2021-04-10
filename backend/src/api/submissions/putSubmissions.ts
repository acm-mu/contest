import { Request, Response } from 'express';
import { matchedData, ParamSchema, validationResult } from "express-validator";
import { io, sendNotification } from '../../server';
import contest from '../../abacus/contest';

export const schema: Record<string, ParamSchema> = {
  sid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'sid is not supplied'
  },
  division: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'division is invalid'
  },
  language: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'language is invalid'
  },
  pid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'pid is invalid'
  },
  status: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'status is invalid'
  },
  sub_no: {
    in: 'body',
    isNumeric: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'sub_no is invalid'
  },
  tid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true,
    errorMessage: 'tid is invalid'
  },
  released: {
    in: 'body',
    isBoolean: true,
    optional: true
  },
  claimed: {
    in: 'body',
    optional: true
  }
}

const notifyTeam = async (item: Record<string, any>) => {
  const res = await contest.scanItems('submission', { args: { sid: item.sid } })
  if (!res) return

  sendNotification({
    to: `uid:${res[0].tid}`,
    header: 'Feedback!',
    content: 'Your submission has been graded!',
    context: {
      type: 'sid',
      id: item.sid
    }
  })
}

export const putSubmissions = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }
  const item = matchedData(req)
  try {
    await contest.updateItem('submission', { sid: item.sid }, item)

    if (item.released == true) notifyTeam(item)

    io.emit('update_submission', { sid: item.sid })

    res.send(item)
  } catch (err) {
    console.error(err);
    res.sendStatus(500)
  }
}
