import express from "express"
import { ApplicationController } from "../controller/application.controller";
import { AddApplicationDTO } from "../dtos/addApplicationDto";
import { validateDto } from "../middleware/validateDto";
import { authChecker } from "../middleware/authChecker";
import { UpdateApplicationCommentDTO } from "../dtos/updateApplicationCommentDto";
import { UpdateApplicationDTO } from "../dtos/updateApplicationDto";
const router = express.Router();
const applicationController = new ApplicationController();

router.post("/:venueId",validateDto(AddApplicationDTO),authChecker(["hirer"]) ,applicationController.addApplication.bind(applicationController));
router.put("/:applicationId/status",validateDto(UpdateApplicationDTO),authChecker(["vendor"]),applicationController.updateApplicationStatus.bind(applicationController));
router.put(
  "/:applicationId/comment",
  validateDto(UpdateApplicationCommentDTO),
  authChecker(["vendor"]),
  applicationController.updateApplicationComment.bind(applicationController),
);
router.get("/:vendorId",applicationController.getApplications.bind(applicationController));
router.get("/:vendorId/:applicationId",applicationController.getApplication.bind(applicationController));
export default router;
