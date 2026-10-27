// src/components/forms/VaccineForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";
import Notification from "../Notification.jsx";

const VaccineForm = ({ mode = 'resident' }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    diseasesCovered: "",
    recommendedAge: "",
    dosesRequired: "",
    sideEffects: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [selectedDiseaseNames, setSelectedDiseaseNames] = useState([]);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const base = mode === 'admin' ? `${BACKEND_URL}/api/admin` : `${BACKEND_URL}/api/resident`;
        const res = await axios.get(`${base}/diseases`, { withCredentials: true });
        setDiseases(res.data?.data || []);
      } catch (e) {
        // ignore silently; autocomplete will just be empty
      }
    };
    fetchDiseases();
  }, [mode]);

  const filteredDiseaseOptions = useMemo(() => {
    const q = diseaseQuery.trim().toLowerCase();
    if (!q) return diseases.filter(d => !selectedDiseaseNames.includes(d.name));
    return diseases
      .filter(d => d.name?.toLowerCase().includes(q))
      .filter(d => !selectedDiseaseNames.includes(d.name));
  }, [diseaseQuery, diseases, selectedDiseaseNames]);

  const addDiseaseSelection = (name) => {
    if (!name || selectedDiseaseNames.includes(name)) return;
    setSelectedDiseaseNames(prev => [...prev, name]);
    setDiseaseQuery("");
  };

  const removeDiseaseSelection = (name) => {
    setSelectedDiseaseNames(prev => prev.filter(n => n !== name));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSubmitting(true);

    try {
      const base = mode === 'admin' ? `${BACKEND_URL}/api/admin` : `${BACKEND_URL}/api/resident`;
      const diseaseIdsOrNames = mode === 'admin'
        ? selectedDiseaseNames
            .map(name => diseases.find(d => d.name?.toLowerCase() === name.toLowerCase())?._id)
            .filter(Boolean)
        : selectedDiseaseNames;

      if ((mode === 'admin' && diseaseIdsOrNames.length === 0) || selectedDiseaseNames.length === 0) {
        setMessage({ type: 'error', text: 'Select at least one approved disease' });
        setSubmitting(false);
        return;
      }

      await axios.post(`${base}/vaccines`, {
        name: formData.name,
        description: formData.description,
        diseasesCovered: diseaseIdsOrNames,
        recommendedAge: formData.recommendedAge,
        dosesRequired: parseInt(formData.dosesRequired, 10),
        sideEffects: formData.sideEffects.split(",").map(item => item.trim())
      }, { withCredentials: true });
      setMessage({ type: "success", text: mode === 'admin' ? "Vaccine added successfully!" : "Vaccine submitted successfully! Waiting for admin approval." });
      setFormData({
        name: "",
        description: "",
        recommendedAge: "",
        dosesRequired: "",
        sideEffects: ""
      });
      setSelectedDiseaseNames([]);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <div className="bg-white text-black rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">
            {mode === 'admin' ? 'Add a Vaccine' : 'Submit a Vaccine Request'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'admin'
              ? 'Provide details about the vaccine. This will be added immediately. Diseases must reference approved disease names.'
              : 'Provide details about the vaccine. Submitted for admin approval. Diseases must reference approved disease names.'}
          </p>
        </div>

        {message.text && (
          <div className="mb-4">
            <Notification type={message.type} message={message.text} />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Vaccine Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Hepatitis B"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Brief description..."
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Diseases Covered</label>
            <div className="border rounded-md p-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedDiseaseNames.map(name => (
                  <span key={name} className="inline-flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded">
                    {name}
                    <button type="button" className="ml-2 text-gray-600 hover:text-black" onClick={() => removeDiseaseSelection(name)}>×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={diseaseQuery}
                onChange={(e) => setDiseaseQuery(e.target.value)}
                className="w-full p-2 focus:outline-none"
                placeholder="Type to search approved diseases..."
              />
              {filteredDiseaseOptions.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white text-black">
                  {filteredDiseaseOptions.map(d => (
                    <button
                      key={d._id || d.name}
                      type="button"
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => addDiseaseSelection(d.name)}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedDiseaseNames.length === 0 && (
              <p className="text-xs text-gray-600 mt-1">Select at least one approved disease.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recommended Age</label>
            <input
              type="text"
              name="recommendedAge"
              value={formData.recommendedAge}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., 6 months+"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Doses Required</label>
            <input
              type="number"
              name="dosesRequired"
              value={formData.dosesRequired}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., 3"
              min={1}
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Side Effects</label>
            <input
              type="text"
              name="sideEffects"
              value={formData.sideEffects}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Comma-separated (e.g., fever, fatigue)"
              required
            />
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : (mode === 'admin' ? "Add Vaccine" : "Submit Request")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VaccineForm;