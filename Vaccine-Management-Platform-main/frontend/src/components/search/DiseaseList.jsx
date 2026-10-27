import React from 'react'

const DiseaseList = ({ diseases }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array.isArray(diseases) && diseases.length > 0 ? (
        diseases.map((disease) => (
          <div key={disease._id} className="border p-4 rounded-lg shadow-lg bg-white">
            <h3 className="text-xl font-bold text-green-700">{disease.name}</h3>
            <p className="text-gray-700 mt-1"><strong>Description:</strong> {disease.description}</p>
            {Array.isArray(disease.affectedAreas) && disease.affectedAreas.length > 0 && (
              <p className="text-gray-700 mt-1"><strong>Affected Areas:</strong> {disease.affectedAreas.join(', ')}</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600">No diseases found.</p>
      )}
    </div>
  )
}

export default DiseaseList


