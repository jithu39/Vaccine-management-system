// src/pages/resident/AddDiseaseResidentPage.jsx
import React from "react";
import RoleNavbar from "../../components/navs/RoleNavbar.jsx";
import DiseaseForm from "../../components/forms/DiseaseForm";

const AddDiseaseResidentPage = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <RoleNavbar />
            <div className="pt-20 px-4 pb-8">
                <div className="container mx-auto max-w-2xl">
                    <h1 className="text-3xl font-bold text-center mb-8">Add Disease Record</h1>
                    <DiseaseForm />
                </div>
            </div>
        </div>
    );
};

export default AddDiseaseResidentPage;
