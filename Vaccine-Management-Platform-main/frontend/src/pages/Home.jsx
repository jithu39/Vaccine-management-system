import React, { useEffect, useMemo, useState } from 'react'
import RoleNavbar from '../components/navs/RoleNavbar.jsx'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../components/Auth.jsx'
import axios from 'axios'
import { BACKEND_URL } from '../config.js'
const Home = () => {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return (
      <>
        <RoleNavbar />
        <Navigate to="/admin" replace />
      </>
    )
  }

  // Resident home: show appointments (upcoming, completed)
  if (user?.role === 'resident') {
    return (
      <ResidentHome />
    )
  }

  return (
    <>
      <RoleNavbar />
      <div className='min-h-screen bg-black text-white flex flex-col gap-4 justify-center items-center text-3xl'>
        <div>Home</div>
      </div>
    </>
  )
}

export default Home

const ResidentHome = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const now = useMemo(() => new Date(), [])

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/resident/appointments`, { withCredentials: true })
        setItems(Array.isArray(res.data?.data) ? res.data.data : [])
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const upcoming = useMemo(() => {
    return items.filter(a => a.status !== 'canceled' && a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= now.getTime())
      .sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  }, [items, now])

  const completed = useMemo(() => {
    return items.filter(a => a.status === 'completed' || (a.status === 'scheduled' && new Date(a.scheduledAt).getTime() < now.getTime()))
      .sort((a,b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
  }, [items, now])

  const canceled = useMemo(() => {
    return items.filter(a => a.status === 'canceled')
      .sort((a,b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
  }, [items])

  return (
    <>
      <RoleNavbar />
      <div className='min-h-screen bg-black text-white p-6 space-y-8'>
        <header className='flex items-center justify-between'>
          <h1 className='text-2xl font-semibold'>Welcome</h1>
          <Link to='/resident/appointments' className='text-sm bg-white text-black px-3 py-2 rounded'>Manage Appointments</Link>
        </header>

        <section>
          <h2 className='text-xl font-semibold mb-3'>Upcoming</h2>
          <div className='grid gap-3'>
            {loading && <div className='text-gray-300'>Loading...</div>}
            {!loading && upcoming.length === 0 && <div className='text-gray-300 text-sm'>No upcoming appointments.</div>}
            {upcoming.map(a => (
              <AppointmentRow key={a._id} a={a} />
            ))}
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-3'>Completed</h2>
          <div className='grid gap-3'>
            {loading && <div className='text-gray-300'>Loading...</div>}
            {!loading && completed.length === 0 && <div className='text-gray-300 text-sm'>No completed appointments.</div>}
            {completed.map(a => (
              <AppointmentRow key={a._id} a={a} />
            ))}
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-3'>Canceled</h2>
          <div className='grid gap-3'>
            {loading && <div className='text-gray-300'>Loading...</div>}
            {!loading && canceled.length === 0 && <div className='text-gray-300 text-sm'>No canceled appointments.</div>}
            {canceled.map(a => (
              <AppointmentRow key={a._id} a={a} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

const AppointmentRow = ({ a }) => {
  return (
    <div className='bg-white text-black p-4 rounded flex justify-between items-center'>
      <div>
        <div className='font-semibold'>{a.vaccine?.name || 'Vaccine'}</div>
        <div className='text-sm'>{new Date(a.scheduledAt).toLocaleString()} • {a.location} • dose {a.doseNumber} • {a.status}</div>
      </div>
      <div className='flex items-center gap-2'>
        <Link to='/resident/appointments' className='px-3 py-1 rounded bg-black text-white text-sm'>Details</Link>
      </div>
    </div>
  )
}