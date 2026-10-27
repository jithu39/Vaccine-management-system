import React from 'react'
import RoleNavbar from '../components/navs/RoleNavbar.jsx';

const About = () => {
  return (
    <>
      <RoleNavbar/>
      <main className="min-h-screen bg-black text-white">
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-4">About EpiShield</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            EpiShield is a vaccine and disease management platform that helps residents discover recommended
            vaccines based on location-specific disease prevalence, and enables admins to review and approve
            community-submitted data for accuracy and safety.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="bg-white text-black rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-gray-700">
              Empower communities with timely vaccination guidance and verified disease information.
            </p>
          </div>
          <div className="bg-white text-black rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">For Residents</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Search vaccines recommended in your area</li>
              <li>Request new vaccine and disease entries</li>
              <li>Maintain your profile and preferences</li>
            </ul>
          </div>
          <div className="bg-white text-black rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">For Admins</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Review and approve pending requests</li>
              <li>Manage disease locations and coverage</li>
              <li>Ensure information quality and trust</li>
            </ul>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="bg-white text-black rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-3">How it works</h2>
            <ol className="list-decimal ml-5 text-gray-700 space-y-2">
              <li>Residents submit vaccine/disease requests with details</li>
              <li>Admins validate and approve to make them authoritative</li>
              <li>Search results update based on approved disease locations</li>
            </ol>
          </div>
        </section>
      </main>
    </>
  )
}

export default About