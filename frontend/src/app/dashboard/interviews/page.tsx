"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewService, Interview } from "@/services/interview.service";
import { candidateService } from "@/services/candidate.service";
import { jobService } from "@/services/job.service";
import { scorecardService } from "@/services/scorecard.service";
import { 
  Calendar, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Briefcase,
  Star,
  Plus,
  Trash2
} from "lucide-react";

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => interviewService.getInterviews(),
  });

  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.getCandidates(),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.getJobs(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'completed' | 'cancelled' }) => 
      interviewService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      // We should also invalidate candidates so their timelines update
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const upcoming = interviews?.filter(i => i.status === 'scheduled') || [];
  const completed = interviews?.filter(i => i.status === 'completed') || [];
  const cancelled = interviews?.filter(i => i.status === 'cancelled') || [];

  const getCandidateName = (id: string) => candidates?.find(c => c.id === id)?.name || "Unknown Candidate";
  const getJobTitle = (id: string) => jobs?.find(j => j.id === id)?.title || "Unknown Job";

  const renderInterviewCard = (interview: Interview, isUpcoming: boolean) => (
    <div key={interview.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-gray-700 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            {getCandidateName(interview.candidate_id)}
          </h3>
          <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
            <Briefcase className="w-4 h-4" />
            {getJobTitle(interview.job_id)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          interview.status === 'scheduled' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
          interview.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
          'bg-red-500/20 text-red-400 border-red-500/50'
        }`}>
          {interview.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 text-sm text-gray-300">
        <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(interview.scheduled_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
          <Clock className="w-4 h-4 text-gray-400" />
          {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="col-span-2 flex items-center gap-2 bg-gray-800/50 p-2 rounded">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 mr-1">Interviewer:</span> {interview.interviewer_name}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
        <a 
          href={interview.meeting_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
        >
          <Video className="w-4 h-4" /> Join Meeting
        </a>

        {isUpcoming && (
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedInterview(interview)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Feedback
            </button>
            <button 
              onClick={() => updateStatusMutation.mutate({ id: interview.id, status: 'cancelled' })}
              className="p-1.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition"
              title="Cancel Interview"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Interviews</h1>
        <p className="text-gray-400">Manage all your scheduled, completed, and cancelled candidate interviews.</p>
      </div>

      <div className="space-y-10">
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Upcoming Interviews</h2>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium ml-2">
              {upcoming.length}
            </span>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(i => renderInterviewCard(i, true))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              No upcoming interviews scheduled.
            </div>
          )}
        </section>

        {/* Completed Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-t border-gray-800 pt-10">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Completed</h2>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium ml-2">
              {completed.length}
            </span>
          </div>

          {completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {completed.map(i => renderInterviewCard(i, false))}
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 text-center text-gray-600">
              No completed interviews yet.
            </div>
          )}
        </section>

        {/* Cancelled Section */}
        {cancelled.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-t border-gray-800 pt-10">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Cancelled</h2>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium ml-2">
                {cancelled.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {cancelled.map(i => renderInterviewCard(i, false))}
            </div>
          </section>
        )}
      </div>

      {selectedInterview && (
        <ScorecardModal 
          interview={selectedInterview} 
          onClose={() => setSelectedInterview(null)} 
        />
      )}
    </div>
  );
}

function ScorecardModal({ interview, onClose }: { interview: Interview, onClose: () => void }) {
  const queryClient = useQueryClient();
  
  // Default categories
  const [categories, setCategories] = useState<{name: string, score: number}[]>([
    { name: "Technical Skills", score: 0 },
    { name: "Communication", score: 0 },
    { name: "Culture Fit", score: 0 }
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("neutral");

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { name: newCategoryName.trim(), score: 0 }]);
      setNewCategoryName("");
    }
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const setCategoryScore = (index: number, score: number) => {
    const newCategories = [...categories];
    newCategories[index].score = score;
    setCategories(newCategories);
  };

  const overallScore = categories.length > 0 
    ? categories.reduce((acc, curr) => acc + curr.score, 0) / categories.length 
    : 0;

  const mutation = useMutation({
    mutationFn: (data: any) => scorecardService.submitScorecard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ratingsObj: Record<string, number> = {};
    categories.forEach(c => ratingsObj[c.name] = c.score);

    mutation.mutate({
      interview_id: interview.id,
      candidate_id: interview.candidate_id,
      evaluator_name: interview.interviewer_name,
      ratings: ratingsObj,
      overall_score: overallScore,
      feedback_text: feedback,
      recommendation
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl p-6 my-8">
        <h2 className="text-2xl font-bold text-white mb-2">Interview Scorecard</h2>
        <p className="text-gray-400 mb-6 text-sm">Submit feedback to mark this interview as completed.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dynamic Ratings */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Ratings (1-5)</h3>
              <div className="text-sm text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Overall: {overallScore.toFixed(1)} / 5.0
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <span className="text-gray-300 text-sm font-medium w-1/3 truncate">{cat.name}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setCategoryScore(idx, star)}
                        className={`p-1 transition ${star <= cat.score ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeCategory(idx)}
                    className="text-gray-500 hover:text-red-400 transition ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 items-center border-t border-gray-700 pt-4">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Add new category..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
              />
              <button 
                type="button" 
                onClick={addCategory}
                disabled={!newCategoryName.trim()}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white p-1.5 rounded transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Written Feedback</label>
            <textarea
              required
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback on the candidate's performance..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 custom-scrollbar"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Final Recommendation</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { value: 'strong_hire', label: 'Strong Hire', color: 'bg-green-600', hover: 'hover:bg-green-700' },
                { value: 'hire', label: 'Hire', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
                { value: 'neutral', label: 'Neutral', color: 'bg-gray-600', hover: 'hover:bg-gray-500' },
                { value: 'no_hire', label: 'No Hire', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
                { value: 'strong_no_hire', label: 'Strong No Hire', color: 'bg-red-600', hover: 'hover:bg-red-700' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRecommendation(opt.value)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${
                    recommendation === opt.value 
                      ? `${opt.color} border-transparent text-white shadow-lg` 
                      : `bg-gray-800 border-gray-700 text-gray-400 ${opt.hover} hover:text-white`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || categories.length === 0 || !feedback.trim()}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 transition"
            >
              {mutation.isPending ? "Submitting..." : "Submit Scorecard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
