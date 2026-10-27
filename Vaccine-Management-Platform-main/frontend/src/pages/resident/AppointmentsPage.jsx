import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RoleNavbar from "../../components/navs/RoleNavbar.jsx";
import { BACKEND_URL } from "../../config.js";
import { useLocation } from "react-router-dom";

const minDateTimeLocal = () => {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const y = tomorrow.getFullYear();
  const m = pad(tomorrow.getMonth() + 1);
  const d = pad(tomorrow.getDate());
  const h = pad(tomorrow.getHours());
  const min = pad(tomorrow.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
};

const AppointmentForm = ({ onCreated }) => {
  const locationHook = useLocation();
  const params = new URLSearchParams(locationHook.search);
  const prefillVaccineId = params.get("vaccineId") || "";
  const prefillVaccineName = params.get("vaccineName") || "";
  const [vaccineId, setVaccineId] = useState(prefillVaccineId);
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [doseNumber, setDoseNumber] = useState(1);
  const [vaccines, setVaccines] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/resident/vaccines`, { withCredentials: true });
        setVaccines(res.data?.data || []);
      } catch {
        setVaccines([]);
      }
    };
    fetchVaccines();
  }, []);

  const selected = vaccines.find(v => v._id === vaccineId);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post(
        `${BACKEND_URL}/api/resident/appointments`,
        { vaccineId, scheduledAt, location, doseNumber: Number(doseNumber) },
        { withCredentials: true }
      );
      setVaccineId("");
      setScheduledAt("");
      setLocation("");
      setDoseNumber(1);
      setMessage("Appointment scheduled");
      onCreated?.();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to schedule");
    }
  };

  return (
    <form onSubmit={submit} className="bg-white text-black p-4 rounded shadow space-y-3">
      <div>
        <label className="block mb-1">Vaccine</label>
        <select value={vaccineId} onChange={(e) => setVaccineId(e.target.value)} className="border p-2 w-full">
          <option value="">Select vaccine</option>
          {vaccines.map(v => (
            <option key={v._id} value={v._id}>{v.name}</option>
          ))}
        </select>
        {prefillVaccineName && !selected && (
          <div className="text-xs text-gray-500 mt-1">Suggested: {prefillVaccineName}</div>
        )}
      </div>
      <div>
        <label className="block mb-1">Date & Time</label>
        <input type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} className="border p-2 w-full" min={minDateTimeLocal()} required />
      </div>
      <div>
        <label className="block mb-1">Location</label>
        <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="City/Clinic" className="border p-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Dose Number</label>
        <input type="number" min={1} value={doseNumber} onChange={(e)=>setDoseNumber(e.target.value)} className="border p-2 w-full" />
      </div>
      <button className="bg-black text-white px-4 py-2 rounded">Schedule</button>
      {message && <div className="text-sm text-green-600">{message}</div>}
    </form>
  );
};

const AppointmentsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/resident/appointments`, { withCredentials: true });
      setItems(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const cancel = async (id) => {
    await axios.delete(`${BACKEND_URL}/api/resident/appointments/${id}`, { withCredentials: true });
    fetchItems();
  };

  const toInputValue = (d) => {
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const day = pad(dt.getDate());
    const h = pad(dt.getHours());
    const min = pad(dt.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const openReschedule = (appt) => {
    setEditing(appt);
    setFormScheduledAt(toInputValue(appt.scheduledAt));
    setFormLocation(appt.location || "");
    setIsModalOpen(true);
  };

  const closeReschedule = () => {
    setIsModalOpen(false);
    setEditing(null);
    setFormScheduledAt("");
    setFormLocation("");
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/resident/appointments/${editing._id}`,
        { scheduledAt: formScheduledAt, location: formLocation },
        { withCredentials: true }
      );
      closeReschedule();
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {loading && <div>Loading...</div>}
      {items.map(a => (
        <div key={a._id} className="bg-white text-black p-4 rounded flex justify-between items-center">
          <div>
            <div className="font-semibold">{a.vaccine?.name || "Vaccine"}</div>
            <div className="text-sm">{new Date(a.scheduledAt).toLocaleString()} • {a.location} • dose {a.doseNumber} • {a.status}</div>
          </div>
          <div className="space-x-2">
            {a.status === "scheduled" ? (
              <>
                <button onClick={() => openReschedule(a)} className="px-3 py-1 rounded bg-black text-white">Reschedule</button>
                <button onClick={() => cancel(a._id)} className="px-3 py-1 rounded bg-red-600 text-white">Cancel</button>
              </>
            ) : (
              <span className="text-sm text-gray-500 capitalize">{a.status}</span>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && !loading && <div className="text-gray-300">No appointments yet.</div>}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Reschedule appointment</h3>
            <form onSubmit={submitReschedule} className="space-y-3">
              <div>
                <label className="block mb-1">Date & Time</label>
                <input type="datetime-local" value={formScheduledAt} onChange={(e)=>setFormScheduledAt(e.target.value)} className="border p-2 w-full" min={minDateTimeLocal()} required />
              </div>
              <div>
                <label className="block mb-1">Location</label>
                <input value={formLocation} onChange={(e)=>setFormLocation(e.target.value)} className="border p-2 w-full" placeholder="City/Clinic" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeReschedule} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-black text-white">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentsPage = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const triggerReload = () => setReloadKey(k => k + 1);

  return (
    <>
      <RoleNavbar />
      <div className="min-h-screen bg-black text-white p-6">
        <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppointmentForm onCreated={triggerReload} />
          <div key={reloadKey}>
            <AppointmentsList />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentsPage;