 import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Auth.jsx";
import { BACKEND_URL } from "../../config.js";
import { ChevronRight, ChevronDown, LogOut, User, Pencil } from "lucide-react";

const Dashboard = () => {
  const { user, setUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    role: user?.role || "resident",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      role: user?.role || "resident",
    }));
  }, [user]);

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/users`,
        { name: formData.name, email: formData.email, mobile: formData.mobile },
        { withCredentials: true }
      );
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center p-10">
      <div className="max-w-5xl w-full grid grid-cols-[320px_1fr] gap-6">
        
        {/* Left Section */}
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Card */}
          <div className="bg-white text-black rounded-lg p-5 w-full shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                <img src="/placeholder.svg?height=80&width=80" alt="Profile" className="w-full h-full object-cover"  onError={(e) => (e.target.style.display = "none")} />
              </div>
              <div>
                <h2 className="font-medium text-lg">{formData.name}</h2>
                <p className="text-gray-500 text-sm">{formData.email}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <button className="w-full flex items-center justify-between py-2 hover:bg-gray-100 px-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-500" />
                  <span className="text-sm">My Profile</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button onClick={logout} className="w-full flex items-center gap-3 py-2 hover:bg-gray-100 px-3 rounded-lg">
                <LogOut size={18} className="text-gray-500" />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white text-black rounded-lg p-5 w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Settings</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Theme</span>
                <button className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>Light</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Language</span>
                <button className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>Eng</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Role</span>
                <button className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{formData.role}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Profile Edit Modal */}
        <div className="bg-white text-black rounded-lg p-8 w-full max-w-lg shadow-xl relative">
          

          <div className="flex items-center gap-24">
            <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              <img src="/placeholder.svg?height=80&width=80" alt="Profile" className="w-full h-full object-cover"  onError={(e) => (e.target.style.display = "none")} />
              </div>
            </div>
            <div>
              <h2 className="font-medium text-lg">{formData.name}</h2>
              <p className="text-gray-500 text-sm">{formData.email}</p>
            </div>
            </div>
            <button
            onClick={handleEditToggle}
            className="top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition"
          >
            <Pencil size={18} className="text-gray-600" />
          </button>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email account</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Mobile number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
                readOnly={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-[#56d7ce] text-white px-6 py-2 rounded-md text-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Change"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;