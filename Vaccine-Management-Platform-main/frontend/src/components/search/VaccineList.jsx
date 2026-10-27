import React from 'react';
import VaccineCard from './VaccineCard';

const VaccineList = ({ vaccines, showSchedule = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {vaccines.length > 0 ? (
        vaccines.map((vaccine) => (
          <VaccineCard key={vaccine._id} vaccine={vaccine} showSchedule={showSchedule} />
        ))
      ) : (
        <p className="text-gray-600">No vaccines found.</p>
      )}
    </div>
  );
};

export default VaccineList;
