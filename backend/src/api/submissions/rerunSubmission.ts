import { Converter } from 'aws-sdk/clients/dynamodb';
import { Request, Response } from 'express';
import { matchedData, ParamSchema, validationResult } from "express-validator"
import { contest } from '../../abacus'

export const schema: Record<string, ParamSchema> = {
  sid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'sid is invalid'
  }
}

export const rerunSubmission = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  const submission = await contest.db.scan('submission', { args: matchedData(req) })
  if (submission) {
    try {
      const data = await contest.invoke('PistonRunner', {
        Records: [{
          eventName: "INSERT",
          dynamodb: {
            NewImage: Converter.marshall(submission[0])
          }
        }]
      })
      if (data.StatusCode == 200) res.send(data.Payload)
    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  }
}
