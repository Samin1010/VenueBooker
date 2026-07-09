import express from "express"
import { ReportController } from "../controller/report.controller";

const router = express.Router();
const reportController = new ReportController();

router.get("/",reportController.generateReport.bind(reportController));

export default router;