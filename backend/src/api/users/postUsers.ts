import { createHash } from 'crypto';
import { Request, Response } from 'express'
import { matchedData, ParamSchema, validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid'

import contest from "../../abacus/contest"

export const schema: Record<string, ParamSchema> = {
  display_name: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String display_name is not supplied'
  },
  division: {
    in: 'body',
    isString: true,
    optional: true,
    errorMessage: 'String division is not supplied'
  },
  school: {
    in: 'body',
    isString: true,
    optional: true
  },
  password: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String password is not supplied'
  },
  role: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String role is not supplied'
  },
  username: {
    in: 'body',
    notEmpty: true,
    isString: true,
    errorMessage: 'String username is not supplied'
  }
}

export const postUsers = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  const item = matchedData(req)
  item.username = item.username.toLowerCase()
  item.password = createHash('sha256').update(item.password).digest('hex')

  const users = await contest.scanItems('user', { args: { username: item.username } }) || {}

  if ((item.role == 'team' || item.role == 'judge') && item.division == undefined) {
    res.status(400).json({ message: 'String division is not provided!' })
    return
  }

  if (Object.values(users).length) {
    res.status(400).json({ message: 'Username is taken!' })
    return
  }
  item.uid = uuidv4().replace(/-/g, '')

  try {
    await contest.putItem('user', item)
    res.send(item)
  } catch (err) {
    res.sendStatus(500)
  }
}