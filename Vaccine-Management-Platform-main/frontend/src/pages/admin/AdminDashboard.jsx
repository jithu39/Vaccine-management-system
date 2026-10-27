import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../../config.js'
import AdminNavbar from '../../components/navs/AdminNavbar.jsx'
import VaccineForm from '../../components/forms/VaccineForm.jsx'
import DiseaseForm from '../../components/forms/DiseaseForm.jsx'

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, vaccines: 0, diseases: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStats = useMemo(() => async () => {
    try {
      setLoading(true)
      setError('')
      const [usersRes, vaccinesRes, diseasesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/vaccines`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/diseases`, { withCredentials: true }),
      ])
      setStats({
        users: Array.isArray(usersRes.data?.data) ? usersRes.data.data.length : 0,
        vaccines: Array.isArray(vaccinesRes.data?.data) ? vaccinesRes.data.data.length : 0,
        diseases: Array.isArray(diseasesRes.data?.data) ? diseasesRes.data.data.length : 0,
      })
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <>
      <AdminNavbar />
      <div className='min-h-screen bg-black text-white p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold'>Admin Dashboard</h1>
        </div>

        {error && (
          <div className='mb-4 rounded bg-red-100 text-red-800 px-4 py-2'>{error}</div>
        )}

        <div className='flex flex-wrap items-center gap-4 mb-8'>
          <StatCard label='Users' value={stats.users} loading={loading} />
          <StatCard label='Vaccines' value={stats.vaccines} loading={loading} />
          <StatCard label='Diseases' value={stats.diseases} loading={loading} />
          <button onClick={fetchStats} className='bg-white text-black px-4 py-2 rounded hover:bg-gray-100'>Refresh</button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-xl font-semibold mb-3'>Add Disease (Admin)</h2>
            <DiseaseForm mode='admin' />
          </div>
          <div>
            <h2 className='text-xl font-semibold mb-3'>Add Vaccine (Admin)</h2>
            <VaccineForm mode='admin' />
          </div>
        </div>
      </div>
    </>
  )
}

const StatCard = ({ label, value, loading }) => (
  <div className='bg-white text-black p-4 rounded shadow min-w-[140px]'>
    <div className='text-sm text-gray-600'>{label}</div>
    <div className='text-2xl font-semibold'>{loading ? '…' : value}</div>
  </div>
)

export default AdminDashboard