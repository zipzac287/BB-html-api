import React from 'react'
import { SignupForm } from '@/components/signup-form'

const Signup = () => {
  

  return (
    <div className="min-h-screen w-full relative">
  {/* Radial Gradient Background from Top */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
    }}
  />
    <div className='min-h-screen flex p-20 relative z-10'>
        <div className='w-110 max-w-xl p-10 mx-auto'>
        <SignupForm />
        </div>
    </div>
  </div>
  )
}

export default Signup;