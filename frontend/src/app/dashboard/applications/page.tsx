"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService, Application } from "@/services/application.service";
import { jobService } from "@/services/job.service";
import Link from "next/link";
import { Inbox, CheckCircle, XCircle, Search, ExternalLink, FileText, Filter } from "lucide-react";

export default function ApplicationsDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.getJobs(),
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", selectedJobId],
    queryFn: () => applicationService.getApplications(selectedJobId || undefined),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' }) => 
      applicationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Filter apps
  const filteredApps = (applications || []).filter(app => {
    const matchesSearch = app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-700 text-gray-300";
    if (score >= 80) return "bg-green-500/20 text-green-400";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Applications</h1>
        <p className="text-gray-400">Review incoming applications from the public portal.</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search candidates or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={selectedJobId} 
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 max-w-[200px]"
          >
            <option value="">All Jobs</option>
            {jobs?.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="technical">Technical</option>
            <option value="hr">HR</option>
            <option value="offer">Offer</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job Role</th>
                <th className="px-6 py-4 font-medium text-center">AI Match</th>
                <th className="px-6 py-4 font-medium text-center">HM Feedback</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium">Applied</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link href={`/dashboard/candidates/${app.candidate_id}`} className="font-semibold text-white hover:text-purple-400 transition inline-flex items-center gap-1">
                          {app.candidate_name} <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span className="text-xs text-gray-500">{app.candidate_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-300">
                      {app.job_title}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getScoreColor(app.ai_score)}`}>
                        {app.ai_score !== undefined && app.ai_score !== null ? `${app.ai_score}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.hm_feedback === 'Hire' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        app.hm_feedback === 'Hold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        app.hm_feedback === 'Reject' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {app.hm_feedback || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ['applied', 'screening'].includes(app.status) ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        ['interview', 'technical', 'hr', 'offer', 'offered', 'hired'].includes(app.status) ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {['applied', 'screening', 'interview', 'technical', 'hr'].includes(app.status) && (
                          <>
                            <button 
                              onClick={() => app.hm_feedback === 'Hire' && updateStatusMutation.mutate({ id: app.id, status: 'interview' })}
                              disabled={app.hm_feedback !== 'Hire'}
                              className={`p-1.5 rounded transition ${app.hm_feedback === 'Hire' ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                              title={app.hm_feedback === 'Hire' ? "Move to Interview" : "Blocked: HM Approval Required"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => app.hm_feedback === 'Hire' && updateStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                              disabled={app.hm_feedback !== 'Hire'}
                              className={`p-1.5 rounded transition ${app.hm_feedback === 'Hire' ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                              title={app.hm_feedback === 'Hire' ? "Reject" : "Blocked: HM Approval Required"}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Link 
                          href={`/dashboard/candidates/${app.candidate_id}`}
                          className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded transition ml-2"
                          title="View Profile"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400 text-lg">No applications found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
