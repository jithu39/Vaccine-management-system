import React, { useState } from 'react'
import RoleNavbar from '../components/navs/RoleNavbar.jsx';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <RoleNavbar/>
      <main className='min-h-screen bg-black text-white'>
        <section className='max-w-3xl mx-auto px-6 py-16'>
          <h1 className='text-4xl font-bold mb-4'>Contact Us</h1>
          <p className='text-gray-300 mb-8'>Have questions or feedback? Send us a message.</p>

          <form onSubmit={submit} className='bg-white text-black rounded-lg p-6 space-y-3'>
            <input className='border p-2 w-full rounded' placeholder='Your Name' value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input type='email' className='border p-2 w-full rounded' placeholder='Your Email' value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
            <textarea className='border p-2 w-full rounded' rows={5} placeholder='Your Message' value={form.message} onChange={e=>setForm({...form, message:e.target.value})} required />
            <button type='submit' className='bg-black text-white px-4 py-2 rounded'>Send</button>
            {sent && <div className='text-green-600 text-sm'>Thanks! We’ll get back to you soon.</div>}
          </form>
        </section>

        <section className='max-w-3xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6'>
          <div className='bg-white text-black rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-2'>Email</h2>
            <p className='text-gray-700'>support@epishield.example</p>
          </div>
          <div className='bg-white text-black rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-2'>Address</h2>
            <p className='text-gray-700'>123 Health St, Immunity City</p>
          </div>
        </section>
      </main>
    </>
  )
}

export default Contact