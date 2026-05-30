import Link from 'next/link';
import { Briefcase, Users, LogIn, UserPlus, Search, Building2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-50 dark:bg-gray-950">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Smart <span className="text-blue-600 dark:text-blue-500">ATS</span> Hiring Suite
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          The next-generation applicant tracking system powered by Semantic AI matching. Streamline your hiring process or find your next dream job.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Employer Portal Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employer Portal</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 flex-1">
            For Admins, Recruiters, and Hiring Managers. Manage jobs, review AI-scored candidates, and extend offers.
          </p>
          <div className="flex flex-col sm:flex-row w-full gap-4">
            <Link 
              href="/login" 
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
            <Link 
              href="/signup" 
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </Link>
          </div>
        </div>

        {/* Candidate Portal Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Candidate Portal</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 flex-1">
            Find your next opportunity. Browse open roles, apply with one click, and track your interview status.
          </p>
          <div className="flex flex-col w-full gap-4">
            <Link 
              href="/jobs" 
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-purple-600/20"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </Link>
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <Link 
                href="/candidate/login" 
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
              <Link 
                href="/candidate/register" 
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
              >
                <UserPlus className="w-5 h-5" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
