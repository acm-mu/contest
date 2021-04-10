import { Problem, User } from 'abacus';
import axios from 'axios';
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { matchedData, ParamSchema, validationResult } from "express-validator";
import { io } from '../../server';
import { v4 as uuidv4 } from 'uuid';

import contest from '../../abacus/contest';

export const schema: Record<string, ParamSchema> = {
  pid: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'pid is not supplied'
  },
  language: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  source: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  project_id: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  },
  design_document: {
    in: 'body',
    isString: true,
    notEmpty: true,
    optional: true
  }
}

export const postSubmissions = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  try {
    const item = matchedData(req)

    const user = await contest.getItem('user', { uid: req.user?.uid }) as unknown as User
    if (!user) {
      res.status(400).send('Team does not exist!')
      return
    }

    const problem = await contest.getItem('problem', { pid: item.pid }) as unknown as Problem
    if (!problem) {
      res.status(400).send('Problem does not exist!')
      return
    }
    if (user?.division != problem.division) {
      res.status(400).send('Wrong division!')
      return
    }

    const settings = await contest.get_settings()
    const now = Date.now()
    if (now < settings.start_date * 1000) {
      res.status(400).send('Competition has not started yet!')
      return
    } else if (now > settings.end_date * 1000) {
      res.status(400).send('Competition has ended!')
      return
    }

    const submissions = await contest.scanItems('submission', { args: { tid: req.user?.uid, pid: item.pid } })

    if (submissions) {
      for (const submission of submissions) {
        if (submission.status === 'accepted') {
          res.status(400).send("Team has already solved problem")
          return
        }
        if (submission.status === 'pending') {
          res.status(400).send("Cannot submit while there are submissions for this problem in the pending state")
          return
        }
      }
    }

    let submission: any = {
      sid: uuidv4().replace(/-/g, ''),
      pid: item.pid,
      tid: req.user?.uid,
      division: problem.division,
      released: false,
      sub_no: submissions?.length,
      status: 'pending',
      score: 0,
      date: Date.now() / 1000
    }

    if (req.user?.division == 'blue') {

      if (req.files?.source == undefined) {
        res.status(400).json({ message: "source not provided" })
        return
      }

      if (!item.language) {
        res.status(400).json({ message: "language not provided" })
        return
      }

      const { name: filename, size: filesize, md5, data } = req.files!.source as UploadedFile

      submission = {
        ...submission,
        language: item.language,
        filename,
        filesize,
        md5,
        tests: problem.tests,
        runtime: 0,
        source: data.toString('utf-8')
      }
    } else if (req.user?.division == 'gold') {
      const scratchResponse = await axios.get(`https://api.scratch.mit.edu/projects/${item.project_id}`)
      if (scratchResponse.status !== 200) {
        res.status(400).send('Server cannot access project with that id!')
        return
      }

      submission = {
        ...submission,
        language: 'scratch',
        design_document: item.design_document,
        project_id: item.project_id
      }
    }

    await contest.putItem('submission', submission)

    io.emit('new_submission', { sid: submission.sid })

    res.send(submission)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}
