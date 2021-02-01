import { Router } from "express";
import contest from "../contest";

const submissions = Router();

submissions.get("/", async (req, res) =>
  res.send(await contest.get_submissions(req.query))
);

export default submissions;
