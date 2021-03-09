import { createHash } from 'crypto';
import { Request, Response } from 'express';
import { matchedData, ParamSchema, validationResult } from "express-validator";
import contest from "contest"

export const schema: Record<string, ParamSchema> = {
  uid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: "'uid' is not provided"
  },
  display_name: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  division: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  school: {
    in: 'body',
    isString: true,
    optional: true
  },
  password: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  role: {
    in: 'body',
    isString: true,
    optional: true
  },
  scratch_username: {
    in: 'body',
    isString: true,
    optional: true
  },
  session_token: {
    in: 'body',
    isString: true,
    optional: true
  },
  username: {
    in: 'body',
    isString: true,
    optional: true
  }
}

export const putUsers = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  const item = matchedData(req)
  if (item.username) {
    item.username = item.username.toLowerCase()
  }
  if (item.password) {
    item.password = createHash('sha256').update(item.password).digest('hex')
  }

  try {
    if (item.username) {
      let users = Object.values(await contest.scanItems('user', { username: item.username }) || {})
      users = users.filter((user) => user.uid != item.uid)
      if (users.length > 0) {
        res.status(400).json({ message: "Username is taken!" })
        return
      }
    }

    await contest.updateItem('user', { uid: item.uid }, item)
    res.send(item)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}