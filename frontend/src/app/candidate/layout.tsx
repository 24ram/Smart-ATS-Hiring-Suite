"use client";

import { CandidateAuthProvider, useCandidateAuth } from '@/providers/CandidateAuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Inbox, LogOut, User, Calendar, FileCheck } from 'lucide-react';

function CandidateSidebar() {
  const pathname = usePathname();
  const { user, logout } = useCandidateAuth();

  // Don't show sidebar on auth pages
  if (pathname === '/candidate/login' || pathname === '/candidate/register') {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', href: '/candidate/jobs', icon: Briefcase },
    { name: 'Applications', href: '/candidate/applications', icon: Inbox },
    { name: 'Interviews', href: '/candidate/interviews', icon: Calendar },
    { name: 'Job Offers', href: '/candidate/offers', icon: FileCheck },
    { name: 'Profile', href: '/candidate/profile', icon: User },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900 border-r border-gray-800">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white tracking-wide">
            SMART<span className="text-purple-500">ATS</span>
          </h1>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 px-3 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-purple-500/10 text-purple-400' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="flex-shrink-0 flex flex-col border-t border-gray-800 p-4">
            <div className="flex items-center mb-4">
              <div className="h-9 w-9 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-500/30">
                <span className="text-sm font-bold text-purple-400">
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">{user.name}</p>
                <p className="text-xs font-medium text-gray-400 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-800 hover:text-white rounded-lg transition-colors border border-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/candidate/login' || pathname === '/candidate/register';

  return (
    <div className={isAuthPage ? "" : "md:pl-64 flex flex-col flex-1"}>
      {children}
    </div>
  );
}

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CandidateAuthProvider>
      <div className="min-h-screen bg-gray-950 font-sans selection:bg-purple-500/30">
        <CandidateSidebar />
        <CandidateContent>
          {children}
        </CandidateContent>
      </div>
    </CandidateAuthProvider>
  );
}
