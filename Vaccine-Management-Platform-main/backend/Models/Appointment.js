import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    resident: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    vaccine: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Vaccine", 
      required: true 
    },
    scheduledAt: { 
      type: Date, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    doseNumber: { 
      type: Number, 
      default: 1, 
      min: 1 
    },
    status: { 
      type: String, 
      enum: ["scheduled", "completed", "canceled"], 
      default: "scheduled" 
    },
    notes: { 
      type: String 
    },
  },
  { timestamps: true }
);

// Prevent duplicate appointments for same resident, vaccine, and time
AppointmentSchema.index({ resident: 1, vaccine: 1, scheduledAt: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;


