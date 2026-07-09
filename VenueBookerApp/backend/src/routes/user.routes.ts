import express from "express";
import { UserController } from "../controller/user.controller";
import { UserPreferenceDTO } from "../dtos/addPreferenceDto";
import { validateDto } from "../middleware/validateDto";
import { authChecker } from "../middleware/authChecker";
import { UpdateUserDTO } from "../dtos/updateUser";
import { uploadDocument } from "../dtos/uploadDocument";
import { updateDocumentDto } from "../dtos/updateDocumentDto";

const router = express.Router();
const userController = new UserController();

router.get("/:userId",userController.getUser.bind(userController));
router.get("/:userId/preference/venue/:venueId",userController.getPreferenceByVenue.bind(userController));
router.get("/:userId/preference/:pref_id",userController.getPreference.bind(userController));
router.post("/:userId_/preference",validateDto(UserPreferenceDTO),authChecker(["hirer"]),userController.addPreference.bind(userController));
router.get("/:userId_/preference",userController.getAllPreferences.bind(userController));
router.get("/:userId/preferences/venue/:venueId/can-assign-rank", userController.canAssignPreferenceRank.bind(userController));
router.get("/history/hirer/:userId",userController.getHirerHistory.bind(userController));
router.get("/history/vendor/:userId",userController.getVendorHistory.bind(userController));
router.get("/:userId/documents",userController.getUserDocuments.bind(userController));
router.post("/:userId_/document",validateDto(uploadDocument),authChecker(["hirer"]),userController.uploadUserDocumentFile.bind(userController));
router.put("/:userId_/document/:document_id",validateDto(updateDocumentDto),authChecker(["hirer"]),userController.updateUserDocumentFile.bind(userController));
router.patch("/:userId_/change",validateDto(UpdateUserDTO),authChecker(["hirer","vendor"]),userController.changeUser.bind(userController));
router.put("/:pref_id",authChecker(["hirer"]),userController.updatePreference.bind(userController));
router.delete("/:pref_id",authChecker(["hirer"]),userController.removePreference.bind(userController));

export default router;
