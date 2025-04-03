import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to WeAreCars
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your trusted partner in car rentals. We offer a wide range of vehicles to suit your needs, from city cars to luxury SUVs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/booking"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Start Booking
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Staff Login <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 