"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateService } from "@/services/candidate.service";
import { jobService } from "@/services/job.service";
import { interviewService } from "@/services/interview.service";
import { scorecardService } from "@/services/scorecard.service";
import { offerService } from "@/services/offer.service";
import { applicationService, Application } from "@/services/application.service";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Briefcase,
  Clock,
  MessageSquarePlus,
  Copy,
  ChevronDown,
  Video,
  Activity as ActivityIcon,
  Star,
  ClipboardList,
  FileText
} from "lucide-react";

export default function CandidateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const candidateId = params.id as string;

  const [newNote, setNewNote] = useState("");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { data: candidate, isLoading, isError } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => candidateService.getCandidateDetails(candidateId),
  });

  const { data: scorecards } = useQuery({
    queryKey: ["scorecards", candidateId],
    queryFn: () => scorecardService.getCandidateScorecards(candidateId),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.getJobs(),
  });

  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: () => offerService.getOffers(),
  });

  const candidateOffers = (offers || []).filter(o => o.candidate_id === candidateId);

  const { data: applications } = useQuery({
    queryKey: ["applications", candidateId],
    queryFn: () => applicationService.getApplications(undefined, candidateId),
  });

  const hasHireApproval = applications?.some((app: Application) => app.hm_feedback === 'Hire') ?? false;

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) => candidateService.updateStage(candidateId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
      setIsStageDropdownOpen(false);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => candidateService.addNote(candidateId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
      setNewNote("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Candidate Not Found</h2>
        <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300">
          Go back
        </button>
      </div>
    );
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-700 text-gray-300 border-gray-600";
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/50";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    return "bg-red-500/20 text-red-400 border-red-500/50";
  };

  const getStageColor = (stage?: string) => {
    const s = stage?.toLowerCase() || 'applied';
    if (s === 'hired') return "bg-green-500 text-white";
    if (s === 'rejected') return "bg-red-500 text-white";
    if (s === 'offered') return "bg-blue-500 text-white";
    return "bg-purple-600 text-white";
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(candidate.email);
    // You could add a toast here
  };

  const stages = ["applied", "screening", "interview", "technical", "hr", "offered", "rejected", "hired"];

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/candidates")}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white invisible">Candidate Details</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => hasHireApproval && setIsInterviewModalOpen(true)}
            disabled={!hasHireApproval}
            title={hasHireApproval ? "Schedule Interview" : "Blocked: HM Approval Required"}
            className={`${hasHireApproval ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'} px-4 py-2 rounded-lg text-white flex items-center gap-2 transition`}
          >
            <Video className="w-4 h-4" />
            Schedule Interview
          </button>
          <button
            onClick={() => hasHireApproval && setIsOfferModalOpen(true)}
            disabled={!hasHireApproval}
            title={hasHireApproval ? "Generate Offer" : "Blocked: HM Approval Required"}
            className={`${hasHireApproval ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'} px-4 py-2 rounded-lg text-white flex items-center gap-2 transition`}
          >
            <FileText className="w-4 h-4" />
            Generate Offer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Profile info, AI Panel, Jobs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm backdrop-blur-sm bg-opacity-80">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
                <span className="text-3xl font-bold text-white">
                  {candidate.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-white">{candidate.name}</h1>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(candidate.ai_score)}`}>
                      {candidate.ai_score ? `AI Score: ${candidate.ai_score}%` : "Not Evaluated"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{candidate.email}</span>
                    <button onClick={copyEmail} className="hover:text-white transition ml-1">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </div>
                  )}
                  {candidate.experience && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {candidate.experience}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Added: {new Date(candidate.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.length > 0 ? candidate.skills.map((skill, idx) => (
                  <span key={idx} className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-md text-sm">
                    {skill}
                  </span>
                )) : (
                  <span className="text-gray-500 text-sm italic">No skills extracted</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Intelligence Panel */}
          {candidate.ai_analysis ? (
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-xl p-6 shadow-lg shadow-blue-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-6">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">AI Match Intelligence</h2>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-300 mb-1 uppercase tracking-wider">Recommendation</h3>
                <p className="text-blue-100 font-medium">{candidate.ai_analysis.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.ai_analysis.matched_skills.map((skill, idx) => (
                      <span key={idx} className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.ai_analysis.matched_skills.length === 0 && (
                      <span className="text-gray-500 text-sm">No matches</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-orange-500/20">
                  <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.ai_analysis.missing_skills.map((skill, idx) => (
                      <span key={idx} className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-1 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.ai_analysis.missing_skills.length === 0 && (
                      <span className="text-gray-500 text-sm">No missing core skills</span>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Strengths</h3>
                  <ul className="space-y-2">
                    {candidate.ai_analysis.strengths.map((s, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Weaknesses / Areas of Concern</h3>
                  <ul className="space-y-2">
                    {candidate.ai_analysis.weaknesses.map((w, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-sm">
              <BrainCircuit className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No AI Analysis Yet</h3>
              <p className="text-gray-400 text-sm">Match this candidate to a job to generate insights.</p>
            </div>
          )}

          {/* Aggregated Scorecards Panel */}
          {scorecards && scorecards.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-white">Interview Scorecards</h2>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs ml-2">
                  {scorecards.length} evaluations
                </span>
              </div>

              <div className="space-y-4">
                {scorecards.map(scorecard => (
                  <div key={scorecard.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white text-sm">Interviewer: {scorecard.evaluator_name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(scorecard.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-bold text-white">{scorecard.overall_score.toFixed(1)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${scorecard.recommendation === 'strong_hire' ? 'bg-green-600 text-white' :
                          scorecard.recommendation === 'hire' ? 'bg-emerald-500 text-white' :
                            scorecard.recommendation === 'no_hire' ? 'bg-orange-500 text-white' :
                              scorecard.recommendation === 'strong_no_hire' ? 'bg-red-600 text-white' :
                                'bg-gray-600 text-white'
                          }`}>
                          {scorecard.recommendation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {Object.entries(scorecard.ratings).map(([key, val]) => (
                        <div key={key} className="bg-gray-900 rounded p-2 border border-gray-700 flex justify-between items-center">
                          <span className="text-xs text-gray-400 truncate pr-2">{key}</span>
                          <span className="text-xs font-semibold text-white">{val as number}/5</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-900/50 rounded p-3 text-sm text-gray-300 italic border border-gray-800">
                      "{scorecard.feedback_text}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offer History Panel */}
          {candidateOffers.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-white">Offer History</h2>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs ml-2">
                  {candidateOffers.length} offers
                </span>
              </div>

              <div className="space-y-4">
                {candidateOffers.map(offer => {
                  let statusColor = "bg-gray-600 text-white";
                  if (offer.status === 'draft') statusColor = 'bg-gray-600 text-white';
                  else if (offer.status === 'sent') statusColor = 'bg-blue-600 text-white';
                  else if (offer.status === 'viewed') statusColor = 'bg-purple-600 text-white';
                  else if (offer.status === 'accepted') statusColor = 'bg-green-600 text-white';
                  else if (offer.status === 'declined') statusColor = 'bg-red-600 text-white';
                  else if (offer.status === 'expired') statusColor = 'bg-orange-600 text-white';

                  return (
                    <div key={offer.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{offer.job_title}</h4>
                          <p className="text-xs text-gray-500 mt-1">Generated {new Date(offer.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                            {offer.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-900 rounded-lg p-3 border border-gray-700">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Salary</span>
                          <span className="text-sm font-semibold text-white">{offer.salary}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Joining Date</span>
                          <span className="text-sm font-semibold text-white">{new Date(offer.joining_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => router.push('/dashboard/offers')}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View in Offers Dashboard →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications */}
          {applications && applications.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-white">Applications</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {applications.map(app => (
                  <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{app.job_title || 'Unknown Job'}</h4>
                      {app.ai_score !== undefined && (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreColor(app.ai_score)}`}>
                          {app.ai_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500 uppercase">Stage:</span>
                      <ApplicationStageDropdown application={app} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Notes & Resume Preview */}
        <div className="space-y-6">

          {/* Notes Timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquarePlus className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-white">Recruiter Notes</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
              {candidate.notes && candidate.notes.length > 0 ? (
                candidate.notes.map((note, idx) => {
                  // Format: [YYYY-MM-DD HH:MM] User: Note text
                  const match = note.match(/\[(.*?)\] (.*?): (.*)/);
                  if (match) {
                    return (
                      <div key={idx} className="bg-gray-800 rounded-lg p-3 border border-gray-700 relative">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-blue-400">{match[2]}</span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {match[1]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{match[3]}</p>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-sm text-gray-300">{note}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No notes yet. Add one below.
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a note..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNote.trim()) {
                      addNoteMutation.mutate(newNote);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newNote.trim()) addNoteMutation.mutate(newNote);
                  }}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 transition"
                >
                  {addNoteMutation.isPending ? "..." : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-white">Activity Timeline</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {candidate.activities && candidate.activities.length > 0 ? (
                // sort activities by timestamp descending
                [...candidate.activities].reverse().map((activity, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l border-gray-700 last:border-0 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-gray-900"></div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-gray-200">{activity.type}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{activity.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur z-10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Resume Preview</h2>
              {candidate.resume_url && (
                <a
                  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${candidate.resume_url}`}
                  target="_blank"
                  download
                  className="text-gray-400 hover:text-white transition flex items-center gap-1 text-sm bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
            </div>

            <div className="flex-1 bg-gray-800 flex items-center justify-center relative">
              {candidate.resume_url ? (
                candidate.resume_url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${candidate.resume_url}#toolbar=0`}
                    className="w-full h-full border-none"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-300 mb-2">Preview not available for this file type.</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${candidate.resume_url}`}
                      className="text-blue-400 hover:underline"
                    >
                      Download to view
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No resume uploaded</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && (
        <ScheduleInterviewModal
          candidateId={candidate.id}
          jobs={jobs || []}
          onClose={() => setIsInterviewModalOpen(false)}
          onSuccess={() => {
            setIsInterviewModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
          }}
        />
      )}

      {/* Generate Offer Modal */}
      {isOfferModalOpen && (
        <GenerateOfferModal
          candidateId={candidate.id}
          candidateName={candidate.name}
          jobs={jobs || []}
          onClose={() => setIsOfferModalOpen(false)}
          onSuccess={() => {
            setIsOfferModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
            queryClient.invalidateQueries({ queryKey: ["offers"] });
          }}
        />
      )}

    </div>
  );
}

function ApplicationStageDropdown({ application }: { application: Application }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const stages = ["applied", "screening", "interview", "technical", "hr", "offer", "offered", "rejected", "hired"];

  const getStageColor = (stage?: string) => {
    const s = stage?.toLowerCase() || 'applied';
    if (s === 'hired') return "bg-green-500 text-white";
    if (s === 'rejected') return "bg-red-500 text-white";
    if (s === 'offered') return "bg-blue-500 text-white";
    return "bg-purple-600 text-white";
  };

  const mutation = useMutation({
    mutationFn: (stage: string) => applicationService.updateStatus(application.id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", application.candidate_id] });
      setIsOpen(false);
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStageColor(application.status)}`}
      >
        {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : "Applied"}
        <ChevronDown className="w-3 h-3" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {stages.map(s => (
            <button
              key={s}
              onClick={() => mutation.mutate(s)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleInterviewModal({ candidateId, jobs, onClose, onSuccess }: { candidateId: string, jobs: any[], onClose: () => void, onSuccess: () => void }) {
  const [jobId, setJobId] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => interviewService.createInterview(data),
    onSuccess: () => {
      toast.success('Interview scheduled successfully');
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !interviewerName || !scheduledAt || !meetingLink) {
      alert("Please fill all fields");
      return;
    }

    mutation.mutate({
      candidate_id: candidateId,
      job_id: jobId,
      interviewer_name: interviewerName,
      scheduled_at: new Date(scheduledAt).toISOString(),
      meeting_link: meetingLink
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Schedule Interview</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">-- Select a Job --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Interviewer Name</label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="e.g. https://meet.google.com/xyz"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerateOfferModal({ candidateId, candidateName, jobs, onClose, onSuccess }: { candidateId: string, candidateName: string, jobs: any[], onClose: () => void, onSuccess: () => void }) {
  const [jobId, setJobId] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => offerService.createOffer(data),
    onSuccess: () => {
      toast.success('Offer generated successfully');
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !salary || !joiningDate) {
      alert("Please fill all fields");
      return;
    }

    mutation.mutate({
      candidate_id: candidateId,
      job_id: jobId,
      salary: salary,
      joining_date: new Date(joiningDate).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          Generate Offer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Candidate</label>
            <input
              type="text"
              value={candidateName}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select a Job --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Salary Offer</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $150,000 / year"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Proposed Joining Date</label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition"
            >
              {mutation.isPending ? "Generating..." : "Generate Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
