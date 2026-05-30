"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { useCandidateAuth } from '@/providers/CandidateAuthProvider';
import Link from 'next/link';
import { Inbox, Calendar, FileCheck, ArrowRight, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateDashboardPage() {
  const { user } = useCandidateAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const apps = await candidatePortalService.getApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Active Applications', value: applications.length.toString(), icon: Inbox, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Upcoming Interviews', value: '0', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Job Offers', value: '0', icon: FileCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-gray-400 mt-2">Here's an overview of your job search progress</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-gray-900/50 rounded-2xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center shadow-sm">
              <div className={`p-4 rounded-xl mr-5 ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Applications</h2>
            <Link href="/candidate/applications" className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center transition-colors">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="p-10 text-center">
                <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">You haven't applied to any roles yet</p>
                <Link href="/candidate/jobs" className="mt-4 inline-block text-purple-400 hover:text-purple-300 font-medium">
                  Browse Open Jobs →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="p-6 hover:bg-gray-800/30 transition-colors flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{app.job_title}</h3>
                      <div className="text-sm text-gray-500">
                        Applied {app.created_at ? formatDistanceToNow(new Date(app.created_at)) + ' ago' : 'Recently'}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full uppercase tracking-wider border border-gray-700">
                      {app.status || 'Applied'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
            <Link 
              href="/candidate/jobs" 
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl mb-4 transition-colors group border border-gray-700/50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </div>
                <span className="font-medium text-white group-hover:text-purple-400 transition-colors">Browse Jobs</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </Link>
            
            <Link 
              href="/candidate/applications" 
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors group border border-gray-700/50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                  <Inbox className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium text-white group-hover:text-blue-400 transition-colors">Track Status</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
