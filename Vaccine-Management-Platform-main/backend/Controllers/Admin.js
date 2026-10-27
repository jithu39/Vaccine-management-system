import User from "../Models/User.js";
import Vaccine from "../Models/Vaccine.js";
import Disease from "../Models/Disease.js";
import Appointment from "../Models/Appointment.js";
import VaccineRequest from "../Models/vaccineReq.js";
import DiseaseRequest from "../Models/diseaseReq.js";
import catchAsyncErrors from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/error.js";

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Add a new vaccine
export const addVaccine = catchAsyncErrors(async (req, res, next) => {
  const { name, description, diseasesCovered, recommendedAge, dosesRequired, sideEffects } = req.body;

  if (!name || !description || !recommendedAge || !dosesRequired) {
    return next(new ErrorHandler("name, description, recommendedAge and dosesRequired are required", 400));
  }

  const existingVaccine = await Vaccine.findOne({ name });
  if (existingVaccine) return next(new ErrorHandler("Vaccine already exists", 400));

  const vaccine = await Vaccine.create({
    name,
    description,
    diseasesCovered,
    recommendedAge,
    dosesRequired,
    sideEffects,
    createdBy: req.user._id,
    approvedBy: req.user._id,
    approved: true,
  });

  res.status(201).json({ success: true, message: "Vaccine added", data: vaccine });
});

// Add a new disease 
export const addDisease = catchAsyncErrors(async (req, res, next) => {
  const { name, description, affectedAreas } = req.body;

  if (!name || !description) {
    return next(new ErrorHandler("name and description are required", 400));
  }

  const existingDisease = await Disease.findOne({name });
  if (existingDisease) {
    return next(new ErrorHandler("Disease already exists", 400));
  }

  const newDisease = await Disease.create({
    name,
    description,
    affectedAreas,
    createdBy: req.user._id,
    approvedBy: req.user._id,
    approved: true,
  });

  res.status(201).json({ success: true, message: "Disease added", data: newDisease });
});

// Get all users (password is excluded automatically — schema has select: false)
export const getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, data: users });
});

// Delete a user
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (String(req.user._id) === String(id)) {
    return next(new ErrorHandler("Admins cannot delete their own account from this endpoint", 400));
  }

  const target = await User.findById(id);
  if (!target) return next(new ErrorHandler("User not found", 404));

  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return next(new ErrorHandler("Cannot delete the last remaining admin", 400));
    }
  }

  await target.deleteOne();
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// Approve a vaccine request
export const approveVaccine = catchAsyncErrors(async (req, res, next) => {
  const vaccineReq = await VaccineRequest.findById(req.params.id);
  if (!vaccineReq) return next(new ErrorHandler("Vaccine request not found", 404));

  const { name, description, diseasesCovered, recommendedAge, dosesRequired, sideEffects } = vaccineReq;

  const existingVaccine = await Vaccine.findOne({ name }); 

  if (existingVaccine) {
    const newDiseases = diseasesCovered.filter(
      disease => !existingVaccine.diseasesCovered.includes(disease)
    );

    if (newDiseases.length === 0) {
      return next(new ErrorHandler("Vaccine already covers these diseases", 400));
    }

    existingVaccine.diseasesCovered.push(...newDiseases);
    await existingVaccine.save();
    await vaccineReq.deleteOne();
    return res.status(200).json({ success: true, message: "Vaccine updated with new diseases", data: existingVaccine });
  }

  const newVaccine = await Vaccine.create({
    name,
    description,
    diseasesCovered,
    recommendedAge,
    dosesRequired,
    sideEffects,
    createdBy: vaccineReq.createdBy,
    approvedBy: req.user._id,
    approved: true,
  });

  await vaccineReq.deleteOne();

  res.status(200).json({ success: true, message: "Vaccine approved", data: newVaccine });
});

// Delete a vaccine
export const deleteVaccine = catchAsyncErrors(async (req, res, next) => {
  const vaccine = await Vaccine.findByIdAndDelete(req.params.id);
  if (!vaccine) return next(new ErrorHandler("Vaccine not found", 404));

  res.status(200).json({ success: true, message: "Vaccine deleted" });
});

// Approve a disease request
export const approveDisease = catchAsyncErrors(async (req, res, next) => {
  const diseaseReq = await DiseaseRequest.findById(req.params.id);
  if (!diseaseReq) return next(new ErrorHandler("Disease request not found", 404));

  const { name, description, affectedAreas } = diseaseReq;

  const existingDisease = await Disease.findOne({ name });

  if (existingDisease) {
    const newAffectedAreas = affectedAreas.filter(
      area => !existingDisease.affectedAreas.includes(area)
    );

    if (newAffectedAreas.length === 0) {
      return next(new ErrorHandler("Disease already covers these affected areas", 400));
    }

    existingDisease.affectedAreas.push(...newAffectedAreas);
    await existingDisease.save();
    await diseaseReq.deleteOne();
    return res.status(200).json({ success: true, message: "Disease updated with new affected areas", data: existingDisease });
  }

  const newDisease = await Disease.create({
    name,
    description,
    affectedAreas,
    createdBy: diseaseReq.createdBy,
    approvedBy: req.user._id,
    approved: true,
  });

  await diseaseReq.deleteOne();

  res.status(200).json({ success: true, message: "Disease approved", data: newDisease });
});

// Assign locations to a disease
export const assignLocationsToDisease = catchAsyncErrors(async (req, res, next) => {
  const { locations } = req.body;
  const disease = await Disease.findById(req.params.id);
  if (!disease) return next(new ErrorHandler("Disease not found", 404));

  const areasToAdd = Array.isArray(locations) ? locations : [];
  disease.affectedAreas = [...new Set([...(disease.affectedAreas || []), ...areasToAdd])];
  await disease.save();

  res.status(200).json({ success: true, message: "Locations assigned", data: disease });
});

// Delete a disease
export const deleteDisease = catchAsyncErrors(async (req, res, next) => {
  const disease = await Disease.findByIdAndDelete(req.params.id);
  if (!disease) return next(new ErrorHandler("Disease not found", 404));

  res.status(200).json({ success: true, message: "Disease deleted" });
});

// Edit a disease
export const editDisease = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, affectedAreas } = req.body;

  const disease = await Disease.findById(id);
  if (!disease) return next(new ErrorHandler("Disease not found", 404));

  if (name) disease.name = name;
  if (description) disease.description = description;
  if (affectedAreas) {
    disease.affectedAreas = [...new Set([...disease.affectedAreas, ...affectedAreas])];
  }

  await disease.save();
  res.status(200).json({ success: true, message: "Disease updated", data: disease });
});

// Edit a vaccine
export const editVaccine = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, diseasesCovered, recommendedAge, dosesRequired, sideEffects } = req.body;

  const vaccine = await Vaccine.findById(id);
  if (!vaccine) return next(new ErrorHandler("Vaccine not found", 404));

  if (name) vaccine.name = name;
  if (description) vaccine.description = description;
  if (recommendedAge) vaccine.recommendedAge = recommendedAge;
  if (dosesRequired) vaccine.dosesRequired = dosesRequired;
  if (sideEffects) vaccine.sideEffects = sideEffects;

  if (diseasesCovered) {
    const validDiseases = await Disease.find({ _id: { $in: diseasesCovered }, approved: true });
    const validDiseaseIds = validDiseases.map(d => d._id);

    if (validDiseaseIds.length === 0) {
      return next(new ErrorHandler("No valid diseases found", 400));
    }

    vaccine.diseasesCovered = [...new Set([...vaccine.diseasesCovered, ...validDiseaseIds])];
  }

  await vaccine.save();
  res.status(200).json({ success: true, message: "Vaccine updated", data: vaccine });
});

// Get all pending vaccine requests
export const getVaccineRequests = catchAsyncErrors(async (req, res) => {
  const requests = await VaccineRequest.find();

  const pending = [];
  for (const r of requests) {
    const nameRegex = new RegExp(`^${escapeRegExp(r.name)}$`, 'i');
    const existing = await Vaccine.findOne({ name: nameRegex });
    if (!existing) {
      pending.push(r);
      continue;
    }
    const coversAll = r.diseasesCovered.every(id => existing.diseasesCovered.map(String).includes(String(id)));
    if (!coversAll) pending.push(r);
  }

  res.status(200).json({ success: true, data: pending });
});

// Get all pending disease requests
export const getDiseaseRequests = catchAsyncErrors(async (req, res) => {
  const requests = await DiseaseRequest.find();

  const pending = [];
  for (const r of requests) {
    const nameRegex = new RegExp(`^${escapeRegExp(r.name)}$`, 'i');
    const existing = await Disease.findOne({ name: nameRegex, approved: true });
    if (!existing) {
      pending.push(r);
      continue;
    }
    const existingAreas = (existing.affectedAreas || []).map(a => String(a).toLowerCase());
    const allIncluded = (r.affectedAreas || []).every(a => existingAreas.includes(String(a).toLowerCase()));
    if (!allIncluded) pending.push(r);
  }

  res.status(200).json({ success: true, data: pending });
});

// Get all diseases
export const getAllDiseases = catchAsyncErrors(async (req, res) => {
  const diseases = await Disease.find();
  res.status(200).json({ success: true, data: diseases });
});

// Get all vaccines
export const getAllVaccines = catchAsyncErrors(async (req, res) => {
  const vaccines = await Vaccine.find();
  res.status(200).json({ success: true, data: vaccines });
});

// Get all appointments (optionally filter by status), for staff to review and confirm
export const getAllAppointments = catchAsyncErrors(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const appointments = await Appointment.find(query)
    .sort({ scheduledAt: 1 })
    .populate("resident", "name email mobile")
    .populate("vaccine", "name dosesRequired");

  res.status(200).json({ success: true, data: appointments });
});

// Mark an appointment as completed — this is the only place "completed" can be
// set from; residents cannot self-report completion (see Resident.js).
export const markAppointmentCompleted = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new ErrorHandler("Appointment not found", 404));

  if (appointment.status === "canceled") {
    return next(new ErrorHandler("Cannot complete a canceled appointment", 400));
  }

  appointment.status = "completed";
  await appointment.save();

  const populated = await appointment.populate([
    { path: "resident", select: "name email mobile" },
    { path: "vaccine", select: "name dosesRequired" },
  ]);

  res.status(200).json({ success: true, message: "Appointment marked completed", data: populated });
});