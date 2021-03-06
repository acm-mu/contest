import { Request, Response } from "express";
import { matchedData, ParamSchema, validationResult } from "express-validator";
import contest, { transpose } from "../../abacus/contest";

export const schema: Record<string, ParamSchema> = {
  cid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'cid is not provided'
  },
  body: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  division: {
    in: 'body',
    isString: true,
    optional: true
  },
  title: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  open: {
    in: 'body',
    isBoolean: true,
    notEmpty: true
  },
  context: {
    in: 'body',
    isObject: true,
    notEmpty: true,
    optional: true
  }
}

export const putClarifications = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  try {
    let item = matchedData(req)

    if (!req.user) {
      res.status(400).json({ message: 'User is not valid!' })
      return
    }

    const clarifications = transpose(await contest.scanItems('clarification'), 'cid')

    if (!(item.cid in clarifications)) {
      res.status(400).json({ message: 'Clarification does not exist!' })
      return
    }

    const clarification = { ...clarifications[item.cid], ...item }
    await contest.updateItem('clarification', { cid: item.cid }, item)
    res.send(clarification)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}