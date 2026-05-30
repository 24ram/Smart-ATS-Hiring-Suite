"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { Calendar, Video, Clock, Building } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'completed': 'bg-green-500/10 text-green-400 border-green-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const style = styles[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await candidatePortalService.getInterviews();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load interviews', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-purple-400" />
          My Interviews
        </h1>
        <p className="text-gray-400 mt-2">Manage and join your scheduled interviews</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="h-48 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No interviews scheduled</h3>
          <p className="text-gray-400 mb-6">You don't have any upcoming interviews at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {interviews.map((iv) => (
            <div key={iv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{iv.job_title}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <Building className="w-4 h-4 mr-2" /> SmartATS
                  </div>
                </div>
                <StatusBadge status={iv.status} />
              </div>

              <div className="space-y-3 mb-6 bg-gray-800/30 rounded-lg p-4 border border-gray-800/50 flex-1">
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 mr-3 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium">Scheduled Time</div>
                    <div className="text-sm text-gray-400">
                      {iv.scheduled_at ? format(new Date(iv.scheduled_at), 'MMMM d, yyyy \u2022 h:mm a') : 'TBD'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300 pt-2 border-t border-gray-700/50">
                  <Video className="w-5 h-5 mr-3 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium">Interviewer</div>
                    <div className="text-sm text-gray-400">{iv.interviewer_name || 'Hiring Team'}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                {iv.meeting_link ? (
                  <a 
                    href={iv.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
                ) : (
                  <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                    Link Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
