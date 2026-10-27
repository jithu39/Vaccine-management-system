// src/components/forms/DiseaseForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config.js";
import Notification from "../Notification.jsx";

const DiseaseForm = ({ mode = 'resident' }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    affectedAreas: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSubmitting(true);

    try {
      const base = mode === 'admin' ? `${BACKEND_URL}/api/admin` : `${BACKEND_URL}/api/resident`;
      await axios.post(`${base}/diseases`, {
        name: formData.name,
        description: formData.description,
        affectedAreas: formData.affectedAreas.split(",").map(item => item.trim())
      }, { withCredentials: true });
      setMessage({ type: "success", text: mode === 'admin' ? "Disease added successfully!" : "Disease submitted successfully! Waiting for admin approval." });
      setFormData({
        name: "",
        description: "",
        affectedAreas: ""
      });
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
            {mode === 'admin' ? 'Add a Disease' : 'Submit a Disease Request'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'admin'
              ? 'Enter disease details and affected areas separated by commas. This will be added immediately.'
              : 'Enter disease details and affected areas separated by commas. Submitted for admin approval.'}
          </p>
        </div>

        {message.text && (
          <div className="mb-4">
            <Notification type={message.type} message={message.text} />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Disease Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Dengue"
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
            <label className="block text-sm font-medium mb-1">Affected Areas</label>
            <input
              type="text"
              name="affectedAreas"
              value={formData.affectedAreas}
              onChange={handleChange}
              className="border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Comma-separated (e.g., Mumbai, Delhi)"
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
            {submitting ? "Submitting..." : (mode === 'admin' ? "Add Disease" : "Submit Request")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DiseaseForm;