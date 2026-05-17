import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import T from '@/components/T'
 
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const displayName = session?.user?.name?.split(' ')[0] || 'Account'

  return (
    <div className="min-h-screen bg-white">

      <Navbar session={session} displayName={displayName} />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-green-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <T k="pakistans1VerifiedHomeServicesPla" className="text-teal-700 text-sm font-medium" />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-teal-900 leading-tight mb-6">
              <T k="bookVerifiedWorkersYouCanActuallyTrust" />
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl">
              <T k="plumbersElectriciansTailorsAndMoreVerifiedRatedAnd" />
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/workers" className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl  hover:-translate-y-1 text-lg">
                <T k="findWorkers" />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/workers/register" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl border border-gray-200 transition-all hover:-translate-y-1 text-lg">
                <T k="joinTrusthire" />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4"><T k="allServicesInOnePlace" /></h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto"><T k="servicesDescription" /></p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { 
                icon: <svg className="w-10 h-10 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, 
                nameKey: 'plumber', descKey: 'pipesTapsLeaks', color: 'bg-blue-50 border-blue-100' 
              },
              { 
                icon: <svg className="w-10 h-10 mx-auto text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
                nameKey: 'electrician', descKey: 'wiringRepairs', color: 'bg-yellow-50 border-yellow-100' 
              },
              { 
                icon: <svg className="w-10 h-10 mx-auto text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>, 
                nameKey: 'carpenter', descKey: 'furnitureWoodwork', color: 'bg-orange-50 border-orange-100' 
              },
              { 
                icon: <svg className="w-10 h-10 mx-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, 
                nameKey: 'cleaner', descKey: 'deepCleaning', color: 'bg-green-50 border-green-100' 
              },
              { 
                icon: <svg className="w-10 h-10 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>, 
                nameKey: 'tailor', descKey: 'stitchingAtHome', color: 'bg-purple-50 border-purple-100' 
              },
            ].map((service) => (
              <Link href="/workers" key={service.nameKey} className={`${service.color} border rounded-2xl p-6 text-center hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center`}>
                <div className="mb-3">{service.icon}</div>
                <p className="font-bold text-gray-900 group-hover:text-green-700 transition-colors w-full"><T k={service.nameKey} /></p>
                <p className="text-gray-500 text-xs mt-1 w-full"><T k={service.descKey} /></p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4"><T k="howTrustHireWorks" /></h2>
          <p className="text-gray-500 text-lg"><T k="bookVerifiedWorkerSteps" /></p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-white" />
          {[
            { step: '01', icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4-4h.01M12 20h.01" /></svg>, title: <T k="chooseAService" />, desc: <T k="chooseAServiceDesc" /> },
            { step: '02', icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4" /></svg>, title: <T k="bookInstantly" />, desc: <T k="bookInstantlyDesc" /> },
            { step: '03', icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: <T k="jobDonePayAfter" />, desc: <T k="jobDonePayAfterDesc" /> },
          ].map((item) => (
            <div key={item.step} className="relative text-center p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl text-2xl mb-6 shadow-lg shadow-teal-200">
                {item.icon}
              </div>
              <div className="absolute top-6 right-6 text-6xl font-black text-gray-100">{item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why families trust us</h2>
            <p className="text-gray-500 text-lg">Safety and quality is our promise</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <svg className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>, titleKey: 'cnicVerified', descKey: 'cnicVerifiedDesc' },
              { icon: <svg className="w-10 h-10 text-yellow-500 bg-yellow-50 p-2 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, titleKey: 'ratingSystem', descKey: 'ratingSystemDesc' },
              { icon: <svg className="w-10 h-10 text-blue-600 bg-blue-50 p-2 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, titleKey: 'securePayments', descKey: 'securePaymentsDesc' },
              { icon: <svg className="w-10 h-10 text-emerald-600 bg-emerald-50 p-2 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, titleKey: 'jobGuarantee', descKey: 'jobGuaranteeDesc' },
            ].map((item) => (
              <div key={item.titleKey} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2"><T k={item.titleKey} /></h3>
                <p className="text-gray-500 text-sm leading-relaxed"><T k={item.descKey} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Workers */}
      <section id="workers" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 mb-6">
                <T k="forSkilledWorkers" className="text-green-700 text-sm font-medium" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                <T k="doubleIncome" />
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                <T k="joinTrusthirePitch" />
              </p>
              <div className="space-y-4 mb-10">
                {[
                  'getJobsNearYou',
                  'buildReputation',
                  'getPaidDirect',
                  'workWhenever',
                ].map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium"><T k={key} /></span>
                  </div>
                ))}
              </div>
              <Link href="/workers/register" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-gray-200">
                <T k="joinTrusthire"/>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                  { numberKey: 'topWorkerMonthlyEarningsNumber', labelKey: 'topWorkerMonthlyEarnings', color: 'bg-teal-600 text-white' },
                  { numberKey: 'youKeepOfEveryJobNumber', labelKey: 'youKeepOfEveryJobLabel', color: 'bg-gray-900 text-white' },
                  { numberKey: 'timeToRegisterNumber', labelKey: 'timeToRegisterLabel', color: 'bg-green-50 text-gray-900 border border-green-100' },
                  { numberKey: 'moreJobsNumber', labelKey: 'moreJobsLabel', color: 'bg-gray-50 text-gray-900 border border-gray-100' },
                ].map((card) => (
                  <div key={card.labelKey} className={`${card.color} rounded-2xl p-6`}>
                    <p className="text-3xl font-black mb-2"><T k={card.numberKey} /></p>
                    <p className="text-sm opacity-75"><T k={card.labelKey} /></p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-teal-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <T k="readyToGetStarted" />
            </h2>
            <p className="text-teal-100 text-xl mb-10">
              <T k="joinFamilies" />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white border border-green-500 hover:bg-gray-50 text-black font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-1 shadow-xl text-lg">
                <T k="bookAWorker" />
              </Link>
              <Link href="/workers/register" className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold px-10 py-4 rounded-2xl border border-green-500 transition-all hover:-translate-y-1 text-lg">
                <T k="joinTrusthire" />
              </Link>
            </div>
          </div>
      </section>

      <Footer />

    </div>
  )
}