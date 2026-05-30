"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateJobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await candidatePortalService.getJobDetails(id as string);
      setJob(data);
    } catch (error) {
      console.error('Failed to load job', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyStatus(null);
      await candidatePortalService.applyForJob(id as string);
      setApplyStatus({ type: 'success', message: 'Successfully applied for this role! Redirecting to applications...' });
      setTimeout(() => {
        router.push('/candidate/applications');
      }, 2000);
    } catch (error: any) {
      setApplyStatus({ type: 'error', message: error.response?.data?.detail || 'Failed to apply. You may have already applied.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="p-8 text-white text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <Link href="/candidate/jobs" className="text-purple-400 hover:underline">Return to jobs list</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Link href="/candidate/jobs" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Link>

      {applyStatus && (
        <div className={`p-4 rounded-lg mb-8 flex items-center border ${applyStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {applyStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
          {applyStatus.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                {job.department || 'General'}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                {job.location || 'Remote'}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                {job.type || 'Full-time'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleApply}
            disabled={applying || applyStatus?.type === 'success'}
            className="w-full md:w-auto flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] whitespace-nowrap"
          >
            {applying ? 'Applying...' : applyStatus?.type === 'success' ? 'Applied ✓' : 'Apply Now'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mr-3 text-sm">01</span>
            About the Role
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300">
            {job.description || "No detailed description provided."}
          </div>
        </section>

        {job.requirements && job.requirements.length > 0 && (
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mr-3 text-sm">02</span>
              Requirements & Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {job.requirements.map((req: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-gray-800 text-gray-200 text-sm rounded-lg border border-gray-700">
                  {req}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
