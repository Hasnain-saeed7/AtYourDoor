'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { 
  Wrench, Zap, Hammer, Sparkles, Scissors, 
  Banknote, Target, Star, ShieldCheck, User, MapPin 
} from 'lucide-react'

const CATEGORIES = [
  { id: 'plumber', name: 'Plumber', icon: <Wrench className="w-6 h-6" />, desc: 'Pipes, taps & leaks' },
  { id: 'electrician', name: 'Electrician', icon: <Zap className="w-6 h-6" />, desc: 'Wiring & repairs' },
  { id: 'carpenter', name: 'Carpenter', icon: <Hammer className="w-6 h-6" />, desc: 'Furniture & woodwork' },
  { id: 'cleaner', name: 'Cleaner', icon: <Sparkles className="w-6 h-6" />, desc: 'Deep cleaning' },
  { id: 'tailor', name: 'Tailor', icon: <Scissors className="w-6 h-6" />, desc: 'Stitching at home' },
]

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

export default function WorkerRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    categoryId: '', bio: '', experience: '',
    cnicNumber: '', city: '', area: '', hourlyRate: '',
    profileImage: '',
  })

  // Location logic
  const autocompleteRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 3 && typeof window !== 'undefined') {
      try {
        setOptions({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly"
        });

        importLibrary("places").then(() => {
          if (autocompleteRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
              componentRestrictions: { country: "pk" },
              fields: ["address_components", "name"],
            })
            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace()
              updateForm('area', place.name || "")
              const cityObj = place.address_components?.find(c => c.types.includes("locality") || c.types.includes("administrative_area_level_2"))
              if (cityObj) {
                updateForm('city', cityObj.long_name)
              }
            })
          }
        }).catch(e => console.log("Google Maps API skipped or not configured", e));
      } catch (error) {
        console.error("Initial Map Load Error", error);
      }
    }
  }, [step])

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const address = data.address;
            const city = address.city || address.town || address.state || "";
            if (city) updateForm('city', city);
            const area = address.suburb || address.neighbourhood || address.road || data.display_name;
            updateForm('area', area);
          }
        } catch (err) {
          console.error("Location error:", err);
        }
      })
    } else {
       setError("Geolocation is not supported by your browser")
    }
  }

  function updateForm(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'WORKER',
        }),
      })

      const registerData = await registerRes.json()
      if (!registerRes.ok) {
        setError(registerData.error || 'Registration failed')
        setLoading(false)
        if (registerData.error?.includes('already')) {
          setTimeout(() => router.push('/workers/login'), 2000)
        }
        return
      }

      const workerRes = await fetch('/api/workers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: registerData.userId,
          categoryName: selectedCategory,
          bio: formData.bio,
          experience: formData.experience,
          cnicNumber: formData.cnicNumber,
          cnicImage: 'pending',
          profileImage: formData.profileImage,
          city: formData.city,
          area: formData.area,
          hourlyRate: parseFloat(formData.hourlyRate),
        }),
      })

      const workerData = await workerRes.json()
      if (!workerRes.ok) {
        setError(workerData.error || 'Worker registration failed')
        setLoading(false)
        return
      }

     router.push('/workers/login?registered=worker')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <span className="text-white font-bold text-xl">TrustHire</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-4">
              <span className="text-green-400 text-sm font-medium">For Skilled Workers</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Turn your skills<br />into steady income
            </h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Join Pakistan's most trusted home services platform and get verified jobs delivered to your doorstep.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <Banknote className="w-5 h-5" />, title: 'Earn Rs. 80,000+/month', desc: 'Top workers on our platform' },
              { icon: <Target className="w-5 h-5" />, title: 'Jobs come to you', desc: 'No need to search for clients' },
              { icon: <Star className="w-5 h-5" />, title: 'Build your reputation', desc: 'Reviews that grow your business' },
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'Guaranteed payment', desc: 'Get paid after every job' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-green-400">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
        
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">

          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">TrustHire</span>
          </Link>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-black text-gray-900">Join as a Worker</h1>
              <span className="text-sm font-semibold text-gray-400">Step {step} of 3</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {step === 1 && 'Personal information'}
              {step === 2 && 'Choose your skill'}
              {step === 3 && 'Work details'}
            </p>
          </div>

          {/* Step 1 — Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="Muhammad Ahmed"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="ahmed@example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="03001234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 11 digits.</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.password || !formData.phone) {
                    setError('Please fill all fields')
                    return
                  }
                  if (!/^\d{11}$/.test(formData.phone)) {
                    setError('Phone number must be exactly 11 digits')
                    return
                  }
                  setError('')
                  setStep(2)
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2 — Choose Category */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">Select your primary skill. You can add more later.</p>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCategory === cat.name
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      selectedCategory === cat.name ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${selectedCategory === cat.name ? 'text-green-700' : 'text-gray-900'}`}>
                        {cat.name}
                      </p>
                      <p className="text-gray-400 text-sm">{cat.desc}</p>
                    </div>
                    {selectedCategory === cat.name && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedCategory) {
                      setError('Please select a category')
                      return
                    }
                    setError('')
                    setStep(3)
                  }}
                  className="flex-2 flex-grow-[2] bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Work Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Photo (From Gallery)</label>
                  <label 
                    htmlFor="profile-upload"
                    className="w-full flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    {formData.profileImage ? (
                      <div className="flex flex-col items-center">
                        <img src={formData.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-2" />
                        <span className="text-sm text-green-600 font-semibold">Ready! Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Select photo from gallery</span>
                      </div>
                    )}
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            updateForm('profileImage', reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }} 
                    />
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">CNIC Number</label>
                  <input
                    type="text"
                    value={formData.cnicNumber}
                    onChange={(e) => updateForm('cnicNumber', e.target.value.replace(/\D/g, '').slice(0, 13))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="13 Digit CNIC (e.g. 4210112345671)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 13 digits.</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Real-time Location</label>
                  <div className="flex gap-2">
                    <input
                      ref={autocompleteRef}
                      type="text"
                      value={formData.area}
                      onChange={(e) => updateForm('area', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                      placeholder="Search your area or Google Map location..."
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-200 flex items-center justify-center gap-2 font-semibold whitespace-nowrap shadow-sm hover:shadow"
                    >
                      <MapPin className="w-5 h-5" />
                      Locate Me
                    </button>
                  </div>
                  {formData.city && (
                    <p className="text-sm font-medium text-green-600 mt-2">
                      📍 Selected City: <span className="font-bold">{formData.city}</span>
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly Rate (Rs.)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => updateForm('hourlyRate', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => updateForm('experience', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="e.g. 5 years experience in residential plumbing"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">About You</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 resize-none"
                    placeholder="Tell customers about your skills and experience..."
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (formData.cnicNumber.length !== 13) {
                      setError('CNIC must be exactly 13 digits')
                      return
                    }
                    if (!formData.profileImage) {
                      setError('Please upload a profile photo')
                      return
                    }
                    handleSubmit()
                  }}
                  disabled={loading}
                  className="flex-grow-[2] bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Your application will be reviewed within 24 hours
              </p>
            </div>
          )}

          {error && step !== 3 && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/workers/login" className="text-green-600 font-semibold hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}