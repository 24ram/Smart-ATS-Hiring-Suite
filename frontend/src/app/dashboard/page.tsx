"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { Briefcase, Users, Video, CalendarCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsService.getOverview()
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Active Jobs',
      value: overview?.total_jobs || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      link: '/dashboard/jobs',
      linkText: 'View all jobs'
    },
    {
      name: 'Total Candidates',
      value: overview?.total_candidates || 0,
      icon: Users,
      color: 'bg-green-500',
      link: '/dashboard/candidates',
      linkText: 'View all candidates'
    },
    {
      name: 'Total Interviews',
      value: overview?.interviews?.total || 0,
      icon: Video,
      color: 'bg-purple-500',
      link: '/dashboard/interviews',
      linkText: 'View all interviews'
    },
    {
      name: 'Upcoming Interviews',
      value: overview?.interviews?.upcoming || 0,
      icon: CalendarCheck,
      color: 'bg-pink-500',
      link: '/dashboard/interviews',
      linkText: 'Manage schedule'
    },
    {
      name: 'Completed Interviews',
      value: overview?.interviews?.completed || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      link: '/dashboard/interviews',
      linkText: 'Review completed'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Analytics</h1>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        Overview of your hiring pipeline and activity.
      </p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
              <div className="text-sm">
                <Link href={stat.link} className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                  {stat.linkText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
