import React, { useState } from 'react';
import SearchBar from '../../components/search/SearchBar';
import VaccineList from '../../components/search/VaccineList';
import DiseaseList from '../../components/search/DiseaseList';
import RoleNavbar from '../../components/navs/RoleNavbar.jsx';

const SearchPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [diseases, setDiseases] = useState([]);

  return (<>
  
  
      <RoleNavbar/>
    <div className='min-h-screen bg-black text-white flex-col justify-start items-stretch'>
      <SearchBar setVaccines={setVaccines} setDiseases={setDiseases} />
      <div className='px-4'>
        <h2 className='text-2xl font-semibold mt-4'>Diseases in Area</h2>
      </div>
      <DiseaseList diseases={diseases} />
      <div className='px-4'>
        <h2 className='text-2xl font-semibold mt-4'>Vaccines Available</h2>
      </div>
      <VaccineList vaccines={vaccines} showSchedule={true} />
    </div>
  </>
  );
};

export default SearchPage;
