import mongoose from "mongoose";

const DiseaseSchema = new mongoose.Schema({
  
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    affectedAreas: [{
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
      default: false 
    }
}, { 
  timestamps: true 
});

const Disease = mongoose.model("Disease", DiseaseSchema);

export default Disease;
