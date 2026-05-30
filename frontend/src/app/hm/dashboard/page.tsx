"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import { Briefcase, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HMDashboardPage() {
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, candidatesRes, appsRes] = await Promise.all([
          api.get('/jobs/'),
          api.get('/candidates/'),
          api.get('/applications/'),
        ]);
        
        setStats({
          jobs: jobsRes.data.length,
          candidates: candidatesRes.data.length,
          applications: appsRes.data.length
        });
      } catch (err) {
        console.error('Failed to fetch hm stats', err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Assigned Jobs', value: stats.jobs, icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    { name: 'Assigned Candidates', value: stats.candidates, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Pending Reviews', value: stats.applications, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">HM Overview</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
