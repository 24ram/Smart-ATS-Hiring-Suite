"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import { applicationService } from "@/services/application.service";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Clock, UploadCloud, X, CheckCircle } from "lucide-react";

export default function PublicJobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["public-job", jobId],
    queryFn: () => jobService.getPublicJobById(jobId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <Link href="/jobs" className="text-purple-400 hover:underline">
          Return to open positions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/jobs" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" /> Back to Careers
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">SmartATS<span className="text-purple-400">.</span></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-400 mb-8">
              <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                <Briefcase className="w-4 h-4 text-purple-400" />
                {job.department}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                <MapPin className="w-4 h-4 text-blue-400" />
                {job.location}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                <Clock className="w-4 h-4 text-emerald-400" />
                {job.job_type}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50 text-gray-300">
                {job.salary_range}
              </div>
            </div>

            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">About the Role</h2>
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                {job.description.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Company Overview</h3>
              <p className="text-sm text-gray-400 mb-4">
                We are a fast-growing tech company dedicated to building the future. Join us in our mission to create innovative solutions that impact millions.
              </p>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm font-medium text-white mb-1">Date Posted</p>
                <p className="text-sm text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isApplyModalOpen && (
        <ApplicationModal 
          jobId={job.id} 
          jobTitle={job.title} 
          onClose={() => setIsApplyModalOpen(false)} 
        />
      )}
    </div>
  );
}

function ApplicationModal({ jobId, jobTitle, onClose }: { jobId: string, jobTitle: string, onClose: () => void }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    cover_letter: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
        setError("Only PDF and DOCX files are allowed");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload your resume");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const data = new FormData();
      data.append('job_id', jobId);
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('resume', file);
      
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.linkedin_url) data.append('linkedin_url', formData.linkedin_url);
      if (formData.github_url) data.append('github_url', formData.github_url);
      if (formData.portfolio_url) data.append('portfolio_url', formData.portfolio_url);
      if (formData.cover_letter) data.append('cover_letter', formData.cover_letter);

      await applicationService.submitApplication(data);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for applying for the {jobTitle} role. Our team will review your profile and get back to you soon.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl my-8 flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Apply for {jobTitle}</h2>
            <p className="text-sm text-gray-400 mt-1">Please fill out the form below</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form id="app-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Resume Upload */}
            <div className="bg-gray-800/50 border border-gray-700 border-dashed rounded-xl p-6 text-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.docx" 
                className="hidden" 
              />
              {!file ? (
                <div className="cursor-pointer flex flex-col items-center" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Upload Resume</h3>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 5MB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-300 truncate pr-4">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-purple-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile</label>
                  <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">GitHub Profile</label>
                  <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Portfolio / Website</label>
                  <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="pt-4 border-t border-gray-800">
              <label className="block text-sm font-medium text-gray-400 mb-1">Cover Letter (Optional)</label>
              <textarea name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={4} placeholder="Tell us why you're a great fit..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none custom-scrollbar"></textarea>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-800 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition">
            Cancel
          </button>
          <button type="submit" form="app-form" disabled={isSubmitting} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Submitting...</>
            ) : "Submit Application"}
          </button>
        </div>

      </div>
    </div>
  );
}
