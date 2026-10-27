import express from "express";
import { isAuthenticated, authorizeRoles } from "../Middlewares/auth.js";
import {
  addVaccine,
  getAllUsers,
  deleteUser,
  approveVaccine,
  deleteVaccine,
  approveDisease,
  assignLocationsToDisease,
  deleteDisease,
  addDisease,
  editDisease,
  editVaccine,
  getVaccineRequests,
  getDiseaseRequests,
  getAllDiseases,
  getAllVaccines,
  getAllAppointments,
  markAppointmentCompleted,
} from "../Controllers/Admin.js";
import { getVaccinesByLocation } from "../Controllers/Resident.js";

const router = express.Router();


router.use(isAuthenticated, authorizeRoles("admin"));

// Vaccines
router.get("/vaccines", getAllVaccines);
router.post("/vaccines", addVaccine);
router.get("/vaccines/requests", getVaccineRequests);
router.get("/vaccines/location/:location", getVaccinesByLocation);
router.put("/vaccines/approve/:id", approveVaccine);
router.put("/vaccines/:id", editVaccine);
router.delete("/vaccines/:id", deleteVaccine);

// Diseases
router.get("/diseases", getAllDiseases);
router.post("/diseases", addDisease);
router.get("/diseases/requests", getDiseaseRequests);
router.put("/diseases/approve/:id", approveDisease);
router.put("/diseases/locations/:id", assignLocationsToDisease);
router.put("/diseases/:id", editDisease);
router.delete("/diseases/:id", deleteDisease);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Appointments
router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/complete", markAppointmentCompleted);

export default router;