import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config.js';

const SearchBar = ({ setVaccines, setDiseases, mode = 'resident' }) => {
  const [search, setSearch] = useState('');

  const handleSearch = async () => {
    if (search.trim() === '') return;

    try {
      const base = mode === 'admin' ? `${BACKEND_URL}/api/admin` : `${BACKEND_URL}/api/resident`;
      const response = await axios.get(`${base}/vaccines/location/${encodeURIComponent(search)}`, { withCredentials: true });
      const data = response.data?.data;
      const vaccines = Array.isArray(data?.vaccines) ? data.vaccines : [];
      const diseases = Array.isArray(data?.diseases) ? data.diseases : [];
      setVaccines(vaccines);
      if (setDiseases) setDiseases(diseases);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      setVaccines([]);
    }
  };

  return (
    <div className="p-4 flex space-x-2">
      <input
        type="text"
        placeholder="Enter location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 text-black border rounded w-full"
      />
      <button onClick={handleSearch} className="bg-white text-black hover:bg-slate-100 px-4 py-2 rounded">
        Search
      </button>
    </div>
  );
};

export default SearchBar;