import React, { useState } from 'react'
import RoleNavbar from '../components/navs/RoleNavbar.jsx'
import Dashboard from '../components/Dashboards/Dashboard.jsx'
import { useAuth } from '../components/Auth.jsx'

const Account = () => {
  const { user, login, register, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  // NOTE: no "role" field here — all public self-registration creates a
  // "resident" account. Admin accounts are provisioned separately (not via
  // this public form), matching how the backend now enforces it too.
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (<>
   <RoleNavbar/>
    <div className='min-h-screen bg-black text-white flex justify-center items-center p-6'>
      {user ? (
        <div className='w-full'>
          <Dashboard />
          <div className='flex justify-center mt-4'>
            <button onClick={logout} className='bg-white text-black px-4 py-2 rounded'>Logout</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className='bg-white text-black p-6 rounded w-full max-w-md space-y-3'>
          <h2 className='text-xl font-semibold'>{isLogin ? 'Login' : 'Register'}</h2>
          {error && <p className='text-red-600 text-sm'>{error}</p>}
          {!isLogin && (
            <>
              <input className='border p-2 w-full rounded' placeholder='Name' value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              <input className='border p-2 w-full rounded' placeholder='Mobile' value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} required />
            </>
          )}
          <input type='email' className='border p-2 w-full rounded' placeholder='Email' value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
          <input type='password' className='border p-2 w-full rounded' placeholder='Password' value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required minLength={8} />
          <button type='submit' disabled={submitting} className='bg-black text-white w-full py-2 rounded disabled:opacity-50'>
            {submitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
          <button type='button' onClick={()=>{ setIsLogin(!isLogin); setError(''); }} className='text-sm text-blue-600'>
            {isLogin ? "Don't have an account? Register" : 'Have an account? Login'}
          </button>
        </form>
      )}
    </div>
  </>
  )
}

export default Account