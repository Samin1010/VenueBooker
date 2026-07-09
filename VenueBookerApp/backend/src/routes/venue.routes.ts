import express from "express"
import { VenueController } from "../controller/venue.controller";
import { validateDto } from "../middleware/validateDto";
import { AddVenueDTO } from "../dtos/addVenue";
import { UpdateVenueDTO } from "../dtos/updateVenue";
import { BookedTimeDTO } from "../dtos/bookedTime";
import { authChecker } from "../middleware/authChecker";
import { BaseAuthDTO } from "../dtos/baseAuthDto";

const router = express.Router();
const venueController = new VenueController();

router.get("/",venueController.getAll.bind(venueController));
router.get("/vendor/:vendorId",venueController.getAllForVendor.bind(venueController));
router.get("/:venueId/availability",venueController.getAvailability.bind(venueController));
router.get("/:venueId",venueController.getOne.bind(venueController));
router.post("/",validateDto(AddVenueDTO),authChecker(["vendor"]),venueController.addOne.bind(venueController));
router.put("/:venueId",validateDto(UpdateVenueDTO),authChecker(["vendor"]),venueController.updateOne.bind(venueController));
router.post("/:venueId/addTimeBlock",validateDto(BookedTimeDTO),authChecker(["vendor"]),venueController.blockTimeSlot.bind(venueController));
router.delete("/:venueId/bookedTime/:blockId",authChecker(["vendor"]),venueController.unblockTimeSlot.bind(venueController));
router.delete("/:venueId",venueController.deleteOne.bind(venueController));
router.get("/:venueId/timeslots",venueController.getAllBlockedTimeSlot.bind(venueController));

export default router;
