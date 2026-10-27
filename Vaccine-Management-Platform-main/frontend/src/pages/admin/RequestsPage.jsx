import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../../config.js'
import AdminNavbar from '../../components/navs/AdminNavbar.jsx'
import { useLocation } from 'react-router-dom'

const RequestsPage = () => {
  const [vaccineRequests, setVaccineRequests] = useState([])
  const [diseaseRequests, setDiseaseRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingDiseaseIds, setApprovingDiseaseIds] = useState(new Set())
  const [approvingVaccineIds, setApprovingVaccineIds] = useState(new Set())
  const [errorMessage, setErrorMessage] = useState("")
  const location = useLocation()
  const query = useMemo(() => new URLSearchParams(location.search).get('q')?.trim().toLowerCase() || '', [location.search])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const [vaccinesRes, diseasesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/vaccines/requests`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/diseases/requests`, { withCredentials: true }),
      ])
      setVaccineRequests(vaccinesRes.data?.data || [])
      setDiseaseRequests(diseasesRes.data?.data || [])
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to load pending requests")
    } finally {
      setLoading(false)
    }
  }

  const approveVaccine = async (id) => {
    if (!id) return
    setErrorMessage("")
    setApprovingVaccineIds(prev => new Set(prev).add(id))
    try {
      await axios.put(`${BACKEND_URL}/api/admin/vaccines/approve/${id}`, {}, { withCredentials: true })
      await fetchAll()
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to approve vaccine")
    } finally {
      setApprovingVaccineIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const approveDisease = async (id) => {
    if (!id) return
    setErrorMessage("")
    setApprovingDiseaseIds(prev => new Set(prev).add(id))
    try {
      await axios.put(`${BACKEND_URL}/api/admin/diseases/approve/${id}`, {}, { withCredentials: true })
      await fetchAll()
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to approve disease")
    } finally {
      setApprovingDiseaseIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filteredDiseases = useMemo(() => {
    if (!query) return diseaseRequests
    return diseaseRequests.filter(r =>
      r.name?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    )
  }, [query, diseaseRequests])

  const filteredVaccines = useMemo(() => {
    if (!query) return vaccineRequests
    return vaccineRequests.filter(r =>
      r.name?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    )
  }, [query, vaccineRequests])

  return (
    <>
      <AdminNavbar />
      <div className='min-h-screen bg-black text-white p-6'>
        <h2 className='text-2xl mb-6'>Pending Requests</h2>
        {errorMessage && (
          <div className='mb-4 rounded bg-red-100 text-red-800 px-4 py-2'>{errorMessage}</div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <section>
              <h3 className='text-xl mb-4'>Diseases</h3>
              <div className='grid gap-4'>
                {filteredDiseases.map(r => (
                  <div key={r._id} className='bg-white text-black p-4 rounded'>
                    <div className='font-semibold'>{r.name}</div>
                    <div className='text-sm'>{r.description}</div>
                    <button
                      onClick={() => approveDisease(r._id)}
                      disabled={approvingDiseaseIds.has(r._id)}
                      className={`mt-2 px-3 py-1 rounded text-white ${approvingDiseaseIds.has(r._id) ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
                    >
                      {approvingDiseaseIds.has(r._id) ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                ))}
                {diseaseRequests.length === 0 && <div>No pending disease requests</div>}
              </div>
            </section>

            <section>
              <h3 className='text-xl mb-4'>Vaccines</h3>
              <div className='grid gap-4'>
                {filteredVaccines.map(r => (
                  <div key={r._id} className='bg-white text-black p-4 rounded'>
                    <div className='font-semibold'>{r.name}</div>
                    <div className='text-sm'>{r.description}</div>
                    <button
                      onClick={() => approveVaccine(r._id)}
                      disabled={approvingVaccineIds.has(r._id)}
                      className={`mt-2 px-3 py-1 rounded text-white ${approvingVaccineIds.has(r._id) ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
                    >
                      {approvingVaccineIds.has(r._id) ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                ))}
                {vaccineRequests.length === 0 && <div>No pending vaccine requests</div>}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

export default RequestsPage