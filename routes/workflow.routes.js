import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";

const workflowRouter = Router();

workflowRouter.use("/subscription/reminder", sendReminders);

export default workflowRouter;
