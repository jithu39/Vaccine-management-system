import React from 'react';
import { useNavigate } from 'react-router-dom';

const VaccineCard = ({ vaccine, showSchedule = false }) => {
  const navigate = useNavigate();
  const goSchedule = () => {
    navigate(`/resident/appointments?vaccineId=${encodeURIComponent(vaccine._id)}&vaccineName=${encodeURIComponent(vaccine.name)}`);
  };
  return (
    <div className="border p-4 rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-600">{vaccine.name}</h3>
      <p className="text-gray-700 mt-1"><strong>Description:</strong> {vaccine.description}</p>
      <p className="text-gray-700 mt-1"><strong>Recommended Age:</strong> {vaccine.recommendedAge}</p>
      <p className="text-gray-700 mt-1"><strong>Doses Required:</strong> {vaccine.dosesRequired}</p>
      {vaccine.sideEffects.length > 0 && (
        <p className="text-red-500 mt-1"><strong>Side Effects:</strong> {vaccine.sideEffects.join(', ')}</p>
      )}
      {showSchedule && (
        <div className="mt-3">
          <button onClick={goSchedule} className="bg-black text-white px-4 py-2 rounded">Schedule</button>
        </div>
      )}
    </div>
  );
};

export default VaccineCard;
