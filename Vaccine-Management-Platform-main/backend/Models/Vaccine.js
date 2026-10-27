import mongoose from "mongoose";

const VaccineSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    diseasesCovered: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Disease" 
    }],
    recommendedAge: { 
      type: String, 
      required: true 
    },
    dosesRequired: { 
      type: Number, 
      required: true 
    },
    sideEffects: [{ 
      type: String 
    }],
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approved: { 
      type: Boolean, 
      default: false }
  }, {  
    timestamps: true 
  });

const Vaccine = mongoose.model("Vaccine", VaccineSchema);

export default Vaccine;
