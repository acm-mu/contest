import { Router } from "express"
import { checkSchema } from "express-validator"
import { getStandings, schema as getStandingsSchema } from "./getStandings"

const standings = Router()

standings.get('/standings', checkSchema(getStandingsSchema), getStandings)

export default standings