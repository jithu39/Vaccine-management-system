import mongoose from "mongoose";

const VaccineRequestSchema = new mongoose.Schema({
    name: { 
      type: String,
      required: true,  
    },
    description: { 
      type: String, 
      required: true 
    },
    diseasesCovered: [
      { type: mongoose.Schema.Types.ObjectId, 
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
}, { 
  timestamps: true 
});

const VaccineRequest = mongoose.model("VaccineRequest", VaccineRequestSchema);

export default VaccineRequest;
