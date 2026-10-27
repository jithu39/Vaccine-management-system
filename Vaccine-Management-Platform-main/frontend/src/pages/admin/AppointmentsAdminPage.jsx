import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../../config.js'
import AdminNavbar from '../../components/navs/AdminNavbar.jsx'

const AppointmentsAdminPage = () => {
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('scheduled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completingId, setCompletingId] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await axios.get(`${BACKEND_URL}/api/admin/appointments`, {
        withCredentials: true,
        params,
      })
      setItems(res.data?.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [statusFilter])

  const markCompleted = async (id) => {
    setCompletingId(id)
    setError('')
    try {
      await axios.put(`${BACKEND_URL}/api/admin/appointments/${id}/complete`, {}, { withCredentials: true })
      fetchItems()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark appointment completed')
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <>
      <AdminNavbar />
      <div className='min-h-screen bg-black text-white p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-semibold'>Appointments</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='bg-white text-black px-3 py-2 rounded'
          >
            <option value='scheduled'>Scheduled</option>
            <option value='completed'>Completed</option>
            <option value='canceled'>Canceled</option>
            <option value=''>All</option>
          </select>
        </div>

        {error && <div className='mb-4 rounded bg-red-100 text-red-800 px-4 py-2'>{error}</div>}
        {loading && <div>Loading...</div>}

        <div className='grid gap-3'>
          {items.map(a => (
            <div key={a._id} className='bg-white text-black p-4 rounded flex justify-between items-center'>
              <div>
                <div className='font-semibold'>{a.vaccine?.name || 'Vaccine'} — dose {a.doseNumber}</div>
                <div className='text-sm'>
                  {a.resident?.name} ({a.resident?.email}) • {new Date(a.scheduledAt).toLocaleString()} • {a.location} • {a.status}
                </div>
              </div>
              {a.status === 'scheduled' && (
                <button
                  onClick={() => markCompleted(a._id)}
                  disabled={completingId === a._id}
                  className='px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50'
                >
                  {completingId === a._id ? 'Saving...' : 'Mark completed'}
                </button>
              )}
            </div>
          ))}
          {!loading && items.length === 0 && <div className='text-gray-300'>No appointments found.</div>}
        </div>
      </div>
    </>
  )
}

export default AppointmentsAdminPage