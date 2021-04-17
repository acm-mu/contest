import axios from 'axios';
import { Request, Response } from 'express';
import { matchedData, ParamSchema, validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';

import contest from '../../abacus/contest';

export const schema: Record<string, ParamSchema> = {
  id: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'id is not supplied'
  },
  division: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'division is not supplied'
  },
  name: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'name is not supplied'
  },
  memory_limit: {
    in: 'body',
    isNumeric: true,
    optional: true
  },
  cpu_time_limit: {
    in: 'body',
    isNumeric: true,
    optional: true
  },
  description: {
    in: 'body',
    isString: true,
    notEmpty: true,
    errorMessage: 'description is not supplied'
  },
  skeletons: {
    in: 'body',
    optional: true
  },
  solutions: {
    in: 'body',
    optional: true
  },
  tests: {
    in: 'body',
    optional: true
  },
  max_points: {
    in: 'body',
    optional: true
  },
  capped_points: {
    in: 'body',
    optional: true
  },
  project_id: {
    in: 'body',
    optional: true
  },
  design_document: {
    in: 'body',
    isBoolean: true,
    optional: true
  },
  practice: {
    in: 'body',
    isBoolean: true,
    optional: true
  }
}

export const postProblems = async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    res.status(400).json({ message: errors[0].msg })
    return
  }

  const item = matchedData(req)
  item.pid = uuidv4().replace(/-/g, '')

  if (item.division == 'gold' && item.project_id) {
    const scratchResponse = await axios.get(`https://api.scratch.mit.edu/projects/${item.project_id}`)
    if (scratchResponse.status !== 200) {
      res.status(400).send('Server cannot access project with that id!')
      return
    }
  }

  const problems = await contest.scanItems('problem', { args: { id: item.id, division: item.division } }) || {}
  if (Object.values(problems).length > 0) {
    res.status(400).json({ message: "Problem id is taken!" })
    return
  }

  try {
    await contest.putItem('problem', item)
    res.send(item)
  }
  catch (err) {
    res.sendStatus(500);
  }
}