"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import { Users, Briefcase, Inbox, Calendar, FileText, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Recruiters', value: stats?.total_recruiters || 0, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { name: 'Total Hiring Mgrs', value: stats?.total_hiring_managers || 0, icon: UserPlus, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    { name: 'Total Candidates', value: stats?.total_candidates || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Total Jobs', value: stats?.total_jobs || 0, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Total Applications', value: stats?.total_applications || 0, icon: Inbox, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { name: 'Total Interviews', value: stats?.total_interviews || 0, icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    { name: 'Total Offers', value: stats?.total_offers || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">System Overview</h1>

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
