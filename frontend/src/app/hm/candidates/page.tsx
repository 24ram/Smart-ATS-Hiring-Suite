"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, Application } from '@/services/application.service';
import toast from 'react-hot-toast';

export default function HMCandidatesPage() {
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useQuery({
    queryKey: ['hm_applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string, feedback: string }) => applicationService.submitFeedback(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hm_applications'] });
      toast.success('Feedback submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    }
  });

  const handleFeedback = (id: string, feedback: string) => {
    feedbackMutation.mutate({ id, feedback });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Candidates</h1>
      <p className="text-gray-500 mb-6">Candidates who have applied to your assigned jobs.</p>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : applications?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No candidates to review.</td></tr>
            ) : (
              applications?.map((app: Application) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{app.candidate_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{app.candidate_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.job_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.ai_score !== undefined && app.ai_score !== null ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.ai_score >= 80 ? 'bg-green-100 text-green-800' :
                        app.ai_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.ai_score.toFixed(1)}% Match
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={app.hm_feedback || ""}
                      onChange={(e) => handleFeedback(app.id, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                      disabled={feedbackMutation.isPending}
                    >
                      <option value="" disabled>Pending</option>
                      <option value="Hire">Hire</option>
                      <option value="Hold">Hold</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
