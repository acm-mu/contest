import { Router } from "express";
import { checkSchema } from "express-validator";
import { isAdminUser, isAuthenticated } from "../../abacus/authlib";
import { getUsers, schema as getSchema } from "./getUsers";
import { putUsers, schema as putSchema } from "./putUsers";
import { postUsers, schema as postSchema } from './postUsers';
import { deleteUsers, schema as deleteSchema } from "./deleteUsers"
import { exportUsers } from "./exportUsers";

const users = Router()

users.get('/users', isAuthenticated, checkSchema(getSchema), getUsers)
users.put('/users', isAdminUser, checkSchema(putSchema), putUsers)
users.post('/users', isAdminUser, checkSchema(postSchema), postUsers)
users.delete('/users', isAdminUser, checkSchema(deleteSchema), deleteUsers)
users.get('/users.json', isAdminUser, exportUsers)

export default users