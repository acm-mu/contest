import { Request, Response } from 'express';
import { ParamSchema, validationResult } from "express-validator"
import { io } from '../../server';
import contest from '../../abacus/contest';

export const schema: Record<string, ParamSchema> = {
  sid: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'No sid supplied'
  }
}

export const deleteSubmissions = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  if (req.body.sid instanceof Array) {
    let [success, failed] = [0, 0]
    for (const sid of req.body.sid) {
      try {
        await contest.deleteItem('submission', { sid })
        success++
        io.emit('delete_submission', { sid })
      } catch (err) {
        console.error(err)
        failed++
      }
    }
    res.json({ message: `Successfully deleted ${success} submission(s) (${failed} failed).` })
  } else {
    try {
      await contest.deleteItem('submission', { sid: req.body.sid })

      io.emit('delete_submission', { sid: req.body.sid })

      res.json({ message: "Submission successfully deleted" })
    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  }
}