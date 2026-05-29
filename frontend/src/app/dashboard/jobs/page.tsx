"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, Job } from '@/services/job.service';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';

export default function JobsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getJobs(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (job?: Job) => {
    setEditingJob(job || null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all the jobs in your company including their title, company, status, and role.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Job
          </button>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="relative flex-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white py-2 px-3 border"
            placeholder="Search jobs..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Title</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Company</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">Loading jobs...</td>
                    </tr>
                  ) : jobs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">No jobs found. Create one to get started.</td>
                    </tr>
                  ) : (
                    jobs?.map((job) => (
                      <tr key={job.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                          {job.title}
                          <div className="text-gray-500 font-normal">{job.location}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{job.company}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300 capitalize">{job.employment_type.replace('_', ' ')}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            job.status === 'published' ? 'bg-green-100 text-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => openModal(job)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4">
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateJobModal
          isOpen={isModalOpen}
          job={editingJob}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
