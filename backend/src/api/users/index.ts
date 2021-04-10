import { Router } from "express";
import { checkSchema } from "express-validator";
import { hasRole, isAuthenticated } from "../../abacus/authlib";
import { getUsers, schema as getSchema } from "./getUsers";
import { putUsers, schema as putSchema } from "./putUsers";
import { postUsers, schema as postSchema } from './postUsers';
import { deleteUsers, schema as deleteSchema } from "./deleteUsers"

const users = Router()

users.get('/users', isAuthenticated, checkSchema(getSchema), getUsers)
users.put('/users', hasRole('admin'), checkSchema(putSchema), putUsers)
users.post('/users', hasRole('admin'), checkSchema(postSchema), postUsers)
users.delete('/users', hasRole('admin'), checkSchema(deleteSchema), deleteUsers)

export default users