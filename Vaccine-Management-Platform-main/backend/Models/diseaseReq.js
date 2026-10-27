import mongoose from "mongoose";

const DiseaseRequestSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true, 
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
  }, {  
    timestamps: true
   });

const DiseaseRequest = mongoose.model("DiseaseRequest", DiseaseRequestSchema);
export default DiseaseRequest;
