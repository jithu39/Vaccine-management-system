import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../../config.js'
import AdminNavbar from '../../components/navs/AdminNavbar.jsx'

const PendingDiseasesPage = () => {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/diseases/requests`, { withCredentials: true })
      setRequests(res.data?.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load pending disease requests')
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/diseases/approve/${id}`, {}, { withCredentials: true })
      fetchRequests()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to approve disease request')
    }
  }

  useEffect(() => { fetchRequests() }, [])

  return (
    <>
      <AdminNavbar />
      <div className='min-h-screen bg-black text-white p-6'>
        <h2 className='text-2xl mb-4'>Pending Disease Requests</h2>
        {error && <div className='mb-4 rounded bg-red-100 text-red-800 px-4 py-2'>{error}</div>}
        <div className='grid gap-4'>
          {requests.map(r => (
            <div key={r._id} className='bg-white text-black p-4 rounded'>
              <div className='font-semibold'>{r.name}</div>
              <div className='text-sm'>{r.description}</div>
              <button onClick={()=>approve(r._id)} className='mt-2 bg-black text-white px-3 py-1 rounded'>Approve</button>
            </div>
          ))}
          {!loading && requests.length === 0 && <div>No pending requests</div>}
        </div>
      </div>
    </>
  )
}

export default PendingDiseasesPage