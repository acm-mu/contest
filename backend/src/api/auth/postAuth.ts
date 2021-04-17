import { createHash } from 'crypto'
import { Request, Response } from 'express'
import { matchedData, ParamSchema, validationResult } from 'express-validator'
import contest from '../../abacus/contest'
import jwt from 'jsonwebtoken';

export const schema: Record<string, ParamSchema> = {
  username: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'username is not provided'
  },
  password: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'password is not provided'
  }
}

export const postAuth = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  const bodyData = matchedData(req)
  bodyData.username = bodyData.username.toLowerCase()
  bodyData.password = createHash('sha256').update(bodyData.password).digest('hex')

  try {
    const users = await contest.scanItems('user', { args: bodyData })
    if (!users?.length) {
      res.status(400).send({ message: "Hmmm... We can't find a user with that username and password!" })
      return
    }
    const user = users[0]

    const accessToken = jwt.sign({
      username: user.username,
      password: user.password
    }, process.env.ACCESS_TOKEN_SECRET || '')

    delete user.password

    res.send({ accessToken, ...user })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}