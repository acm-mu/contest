import { Router } from "express";
import { checkSchema } from "express-validator";
import { hasRole } from "../../abacus/authlib";
import { deleteProblems, schema as deleteSchema } from "./deleteProblems";
import { downloadFiles, schema as downloadSchema } from "./downloadFiles";
import { getProblems, schema as getSchema } from "./getProblems";
import { postProblems, schema as postSchema } from "./postProblems";
import { putProblems, schema as putSchema } from "./putProblems";

const problems = Router()

problems.get('/problems', checkSchema(getSchema), getProblems)
problems.get('/sample_files', checkSchema(downloadSchema), downloadFiles)

problems.post('/problems', hasRole('admin'), checkSchema(postSchema), postProblems)
problems.put('/problems', hasRole('admin'), checkSchema(putSchema), putProblems)
problems.delete('/problems', hasRole('admin'), checkSchema(deleteSchema), deleteProblems)

export default problems