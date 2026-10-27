import express from "express";
import { isAuthenticated, authorizeRoles } from "../Middlewares/auth.js";
import { residentWriteLimiter } from "../Middlewares/rateLimiters.js";
import {
  getVaccinesByLocation,
  addDiseaseReq,
  addVaccineReq,
  getAllDiseases,
  getApprovedVaccines,
  createAppointment,
  listMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus
} from "../Controllers/Resident.js";

const router = express.Router();

router.use(isAuthenticated, authorizeRoles("resident"));

// get vaccines by location 
router.get("/vaccines/location/:location", getVaccinesByLocation);

//  add a new disease request
router.post("/diseases", residentWriteLimiter, addDiseaseReq);

// add a new vaccine request
router.post("/vaccines", residentWriteLimiter, addVaccineReq);

//fetch approved diseases
router.get("/diseases", getAllDiseases);
//fetch approved vaccines 
router.get("/vaccines", getApprovedVaccines);

// Appointments
router.post("/appointments", residentWriteLimiter, createAppointment);
router.get("/appointments", listMyAppointments);
router.put("/appointments/:id", residentWriteLimiter, rescheduleAppointment);
router.delete("/appointments/:id", residentWriteLimiter, cancelAppointment);
router.put("/appointments/:id/status", residentWriteLimiter, updateAppointmentStatus);

export default router;