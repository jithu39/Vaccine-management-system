import Vaccine from "../Models/Vaccine.js";
import Disease from "../Models/Disease.js";
import VaccineRequest from "../Models/vaccineReq.js";
import DiseaseRequest from "../Models/diseaseReq.js";
import Appointment from "../Models/Appointment.js";
import catchAsyncErrors from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/error.js";

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Get vaccines according to diseases at a specific location
export const getVaccinesByLocation = catchAsyncErrors(async (req, res) => {
  const { location } = req.method === "GET" ? req.params : req.body;

  const trimmed = String(location || "").trim();
  const locRegex = new RegExp(`^${escapeRegExp(trimmed)}$`, "i");

  const diseases = await Disease.find({ affectedAreas: locRegex, approved: true });
  const diseaseIds = diseases.map(disease => disease._id);

  const vaccines = diseaseIds.length > 0
    ? await Vaccine.find({ diseasesCovered: { $in: diseaseIds }, approved: true })
    : [];

  res.status(200).json({ success: true, data: { diseases, vaccines } });
});

// Add a new disease request
export const addDiseaseReq = catchAsyncErrors(async (req, res, next) => {
  const { name, description, affectedAreas } = req.body;

  if (!name || !description) {
    return next(new ErrorHandler("name and description are required", 400));
  }

  const existingRequest = await DiseaseRequest.findOne({ name });
  if (existingRequest) {
    return next(new ErrorHandler("Disease request already pending", 400));
  }
  const existingDisease = await Disease.findOne({ name });
  if (existingDisease) {
    return next(new ErrorHandler("Disease already exists", 400));
  }

  const newDisease = await DiseaseRequest.create({
    name,
    description,
    affectedAreas,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Disease request submitted", data: newDisease });
});

// Add a new vaccine request
export const addVaccineReq = catchAsyncErrors(async (req, res, next) => {
  const { name, description, diseasesCovered, recommendedAge, dosesRequired, sideEffects } = req.body;

  if (!name || !description || !recommendedAge || !dosesRequired) {
    return next(new ErrorHandler("name, description, recommendedAge and dosesRequired are required", 400));
  }

  const normalizedNames = Array.isArray(diseasesCovered)
    ? diseasesCovered.map(n => String(n).trim()).filter(Boolean)
    : [];
  const nameRegexes = normalizedNames.map(n => new RegExp(`^${escapeRegExp(n)}$`, "i"));

  const diseases = await Disease.find({ name: { $in: nameRegexes }, approved: true }, "_id name");

  if (diseases.length === 0) {
    return next(new ErrorHandler("No valid diseases found", 400));
  }

  const diseaseIds = diseases.map(disease => disease._id);

  const existingRequest = await VaccineRequest.findOne({ name });
  if (existingRequest) {
    return next(new ErrorHandler("Vaccine request already pending", 400));
  }
  const existingVaccine = await Vaccine.findOne({
    name: new RegExp(`^${escapeRegExp(name)}$`, "i"),
  });
  if (existingVaccine) {
    return next(new ErrorHandler("Vaccine already exists", 400));
  }

  const newVaccine = await VaccineRequest.create({
    name,
    description,
    diseasesCovered: diseaseIds,
    recommendedAge,
    dosesRequired,
    sideEffects,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, message: "Vaccine request submitted", data: newVaccine });
});

// Get all approved diseases
export const getAllDiseases = catchAsyncErrors(async (req, res) => {
  const diseases = await Disease.find({ approved: true });
  res.status(200).json({ success: true, data: diseases });
});

// Get all approved vaccines (minimal fields, for dropdowns)
export const getApprovedVaccines = catchAsyncErrors(async (req, res) => {
  const vaccines = await Vaccine.find({ approved: true }).select("name dosesRequired recommendedAge");
  res.status(200).json({ success: true, data: vaccines });
});

// Create a new appointment for a resident
export const createAppointment = catchAsyncErrors(async (req, res, next) => {
  const { vaccineId, scheduledAt, location, doseNumber, notes } = req.body;

  if (!vaccineId || !scheduledAt || !location) {
    return next(new ErrorHandler("vaccineId, scheduledAt, and location are required", 400));
  }

  const vaccine = await Vaccine.findOne({ _id: vaccineId, approved: true });
  if (!vaccine) {
    return next(new ErrorHandler("Vaccine not found or not approved", 404));
  }

  const when = new Date(scheduledAt);
  if (isNaN(when.getTime())) {
    return next(new ErrorHandler("scheduledAt must be a valid date-time", 400));
  }
  const today = new Date();
  const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);
  if (when.getTime() < startOfTomorrow.getTime()) {
    return next(new ErrorHandler("scheduledAt must be after today", 400));
  }
  const dose = Number(doseNumber) || 1;
  if (dose < 1 || dose > (vaccine.dosesRequired || Infinity)) {
    return next(new ErrorHandler("Invalid dose number for this vaccine", 400));
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      resident: req.user._id,
      vaccine: vaccine._id,
      scheduledAt: when,
      location: String(location).trim(),
      doseNumber: dose,
      notes: notes ? String(notes).trim() : undefined,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(new ErrorHandler("You already have an appointment for this vaccine at this time", 409));
    }
    throw error;
  }

  const populated = await appointment.populate([{ path: "vaccine", select: "name dosesRequired" }]);

  res.status(201).json({ success: true, message: "Appointment created", data: populated });
});

// List resident's own appointments
export const listMyAppointments = catchAsyncErrors(async (req, res) => {
  const statusFilter = req.query.status; 
  const query = { resident: req.user._id };
  if (statusFilter) query.status = statusFilter;

  const items = await Appointment.find(query)
    .sort({ scheduledAt: 1 })
    .populate({ path: "vaccine", select: "name dosesRequired" });

  res.status(200).json({ success: true, data: items });
});

// Cancel resident's own appointment
export const cancelAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appt = await Appointment.findOne({ _id: id, resident: req.user._id });
  if (!appt) return next(new ErrorHandler("Appointment not found", 404));

  if (appt.status === "canceled") {
    return res.status(200).json({ success: true, data: appt });
  }

  appt.status = "canceled";
  await appt.save();
  res.status(200).json({ success: true, data: appt });
});

// Reschedule resident's own appointment
export const rescheduleAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { scheduledAt, location } = req.body;
  const appt = await Appointment.findOne({ _id: id, resident: req.user._id });
  if (!appt) return next(new ErrorHandler("Appointment not found", 404));

  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime())) {
      return next(new ErrorHandler("scheduledAt must be a valid date-time", 400));
    }
    const today = new Date();
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);
    if (when.getTime() < startOfTomorrow.getTime()) {
      return next(new ErrorHandler("scheduledAt must be after today", 400));
    }
    appt.scheduledAt = when;
    appt.status = "scheduled"; 
  }
  if (location) appt.location = String(location).trim();

  try {
    await appt.save();
  } catch (error) {
    if (error?.code === 11000) {
      return next(new ErrorHandler("Conflicts with an existing appointment", 409));
    }
    throw error;
  }

  res.status(200).json({ success: true, data: appt });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedForResident = ["canceled"];

  if (!allowedForResident.includes(status)) {
    return next(new ErrorHandler(
      `Residents may only set status to one of: ${allowedForResident.join(", ")}`,
      400
    ));
  }

  const appt = await Appointment.findOne({ _id: id, resident: req.user._id });
  if (!appt) return next(new ErrorHandler("Appointment not found", 404));

  appt.status = status;
  await appt.save();
  res.status(200).json({ success: true, data: appt });
});