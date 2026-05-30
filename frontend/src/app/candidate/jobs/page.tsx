"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await candidatePortalService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Open Roles</h1>
        <p className="text-gray-400 mt-2">Discover your next career opportunity</p>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search by job title or department..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No roles found</h3>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-800/50 transition-all group flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {job.title}
                    </h3>
                    <span className="inline-block px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full mt-2">
                      {job.department || 'General'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {job.type || 'Full-time'}
                  </div>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.requirements.slice(0, 3).map((req: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md border border-gray-700">
                        +{job.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500">
                  Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at)) + ' ago' : 'Recently'}
                </span>
                <Link 
                  href={`/candidate/jobs/${job.id}`}
                  className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
