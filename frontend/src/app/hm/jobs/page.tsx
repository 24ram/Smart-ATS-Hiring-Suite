"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/job.service';

export default function HMJobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['hm_jobs'],
    queryFn: () => jobService.getJobs(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assigned Jobs</h1>
      <p className="text-gray-500 mb-6">Jobs that have been assigned to you for review.</p>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : jobs?.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No jobs assigned.</td></tr>
            ) : (
              jobs?.map(job => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.department || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
