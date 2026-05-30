"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { Inbox, ExternalLink, Calendar, Building } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'applied': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'screening': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'interview': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'offer': 'bg-green-500/10 text-green-400 border-green-500/20',
    'hired': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'rejected': 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const style = styles[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await candidatePortalService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Applications</h1>
        <p className="text-gray-400 mt-2">Track the status of your submitted job applications</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No applications yet</h3>
          <p className="text-gray-400 mb-6">You haven't applied to any roles yet.</p>
          <Link href="/candidate/jobs" className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
            Browse Open Roles
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Applied Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-medium text-white mb-1">{app.job_title}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Building className="w-3 h-3 mr-1" /> SmartATS
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        {app.created_at ? format(new Date(app.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/candidate/jobs/${app.job_id}`}
                        className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View Job <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
