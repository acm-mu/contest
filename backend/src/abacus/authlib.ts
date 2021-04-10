import { User } from "abacus";
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import contest from './contest'

export const authenticate = (req: Request, _: Response): Promise<User | undefined> => {
  return new Promise<User | undefined>((resolve, reject) => {
    const { authorization } = req.headers
    const token = authorization && authorization.split(' ')[1]
    if (!token) return reject()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '',
      async (err, data: any) => {
        if (err || !data) return reject()

        try {
          const { username, password } = data
          const users = await contest.scanItems('user', { args: { username, password } }) as unknown as User[]
          if (users.length) {
            req.user = users[0]
            return resolve(users[0])
          }
        } catch (err) { }
        return reject()
      })
  })
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authenticate(req, res)
    if (user) {
      next()
      return
    }
  } catch (err) { }
  res.sendStatus(403)
}

export const hasRole = (role: string): (req: Request, res: Response, next: NextFunction) => Promise<void> => {
  const roleRank = ['team', 'proctor', 'judge', 'admin']
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authenticate(req, res)
      if (user && roleRank.indexOf(user.role) >= roleRank.indexOf(role)) {
        next()
        return
      }
    } catch (err) { }

    res.sendStatus(403)
  }
}