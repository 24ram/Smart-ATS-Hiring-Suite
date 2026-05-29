"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { candidateService, Candidate } from "@/services/candidate.service";
import { jobService } from "@/services/job.service";
import { UploadCloud, Trash2, Search, Cpu, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.getCandidates(),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.getJobs(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete candidate?")) {
      deleteMutation.mutate(id);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-700 text-gray-300";
    if (score >= 90) return "bg-green-600 text-white";
    if (score >= 70) return "bg-yellow-500 text-black";
    return "bg-red-600 text-white";
  };

  return (
    <div className="pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidates</h1>
          <p className="text-gray-400 mt-1">
            Manage your talent pool and AI matching
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white flex items-center gap-2 transition"
        >
          <UploadCloud size={18} />
          Upload Resume
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />

        <input
          type="text"
          placeholder="Search candidates..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-4 text-gray-300">Candidate</th>
              <th className="text-left p-4 text-gray-300">Skills</th>
              <th className="text-left p-4 text-gray-300">AI Score</th>
              <th className="text-left p-4 text-gray-300">Date</th>
              <th className="text-right p-4 text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="p-10 text-center text-gray-400" colSpan={5}>
                  Loading candidates...
                </td>
              </tr>
            ) : candidates?.length === 0 ? (
              <tr>
                <td className="p-16 text-center text-gray-500" colSpan={5}>
                  <div className="flex flex-col items-center">
                    <FileText className="w-14 h-14 mb-4 text-gray-600" />
                    No candidates uploaded yet
                  </div>
                </td>
              </tr>
            ) : (
              candidates?.map((candidate) => (
                <tr
                  key={candidate.id}
                  onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                  className="border-t border-gray-800 hover:bg-gray-800/40 cursor-pointer"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">
                        {candidate.name}
                      </div>

                      <div className="text-sm text-gray-400">
                        {candidate.email}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    {candidate.ai_score ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                          candidate.ai_score
                        )}`}
                      >
                        {candidate.ai_score}%
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Not matched
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(candidate);
                        setIsMatchModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Match
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(candidate.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}

      {isMatchModalOpen && selectedCandidate && (
        <MatchModal
          candidate={selectedCandidate}
          jobs={jobs || []}
          onClose={() => {
            setSelectedCandidate(null);
            setIsMatchModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const mutation = useMutation({
    mutationFn: (data: {
      file: File;
      name: string;
      email: string;
      phone: string;
    }) =>
      candidateService.uploadCandidateResume(
        data.file,
        data.name,
        data.email,
        data.phone
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    mutation.mutate({
      file,
      name,
      email,
      phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Upload Resume
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition"
            >
              <UploadCloud className="mx-auto w-12 h-12 text-gray-400 mb-4" />

              <p className="text-gray-300">
                {file ? file.name : "Click to upload resume"}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                PDF or DOCX only
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Candidate Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-800 p-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Uploading..." : "Upload & Parse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MatchModal({
  candidate,
  jobs,
  onClose,
}: {
  candidate: Candidate;
  jobs: any[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [selectedJobId, setSelectedJobId] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (jobId: string) =>
      candidateService.matchCandidateToJob(jobId, candidate.id),

    onSuccess: (data) => {
      setMatchResult(data);
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const handleMatch = () => {
    if (!selectedJobId) return;
    mutation.mutate(selectedJobId);
  };

  const getColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="text-blue-500" />
          <h2 className="text-2xl font-bold text-white">
            AI Match Engine
          </h2>
        </div>

        {!matchResult ? (
          <>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select Job</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleMatch}
              disabled={!selectedJobId || mutation.isPending}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white"
            >
              {mutation.isPending
                ? "Running AI Analysis..."
                : "Run Match"}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            {matchResult.match_score >= 90 ? (
              <CheckCircle2
                className={`w-20 h-20 mx-auto mb-4 ${getColor(
                  matchResult.match_score
                )}`}
              />
            ) : (
              <AlertCircle
                className={`w-20 h-20 mx-auto mb-4 ${getColor(
                  matchResult.match_score
                )}`}
              />
            )}

            <div
              className={`text-6xl font-extrabold ${getColor(
                matchResult.match_score
              )}`}
            >
              {matchResult.match_score}%
            </div>

            <p className="text-gray-400 mt-2">
              AI Candidate Match Score
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}