import React, { useState } from 'react'
import RoleNavbar from '../../components/navs/RoleNavbar.jsx'
import SearchBar from '../../components/search/SearchBar.jsx'
import DiseaseList from '../../components/search/DiseaseList.jsx'
import VaccineList from '../../components/search/VaccineList.jsx'

const AdminSearchPage = () => {
  const [vaccines, setVaccines] = useState([])
  const [diseases, setDiseases] = useState([])

  return (
    <>
      <RoleNavbar />
      <div className='min-h-screen bg-black text-white flex-col justify-start items-stretch'>
        <SearchBar mode='admin' setVaccines={setVaccines} setDiseases={setDiseases} />
        <div className='px-4'>
          <h2 className='text-2xl font-semibold mt-4'>Diseases in Area</h2>
        </div>
        <DiseaseList diseases={diseases} />
        <div className='px-4'>
          <h2 className='text-2xl font-semibold mt-4'>Vaccines Available</h2>
        </div>
        <VaccineList vaccines={vaccines} />
      </div>
    </>
  )
}

export default AdminSearchPage


