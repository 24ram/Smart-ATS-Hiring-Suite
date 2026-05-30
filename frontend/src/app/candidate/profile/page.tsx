"use client";

import React, { useEffect, useState, useRef } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { User, FileText, Sparkles, UploadCloud, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await candidatePortalService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.docx')) {
      setUploadStatus({ type: 'error', message: 'Only PDF and DOCX files are supported.' });
      return;
    }

    try {
      setUploading(true);
      setUploadStatus(null);
      const updatedProfile = await candidatePortalService.uploadResume(file);
      setProfile(updatedProfile);
      setUploadStatus({ type: 'success', message: 'Resume uploaded and analyzed successfully!' });
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.response?.data?.detail || 'Failed to upload resume.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="h-32 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse" />
        <div className="h-64 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <User className="w-8 h-8 mr-3 text-purple-400" />
          My Profile
        </h1>
        <p className="text-gray-400 mt-2">Manage your personal information and resume</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="text-white bg-gray-800/50 px-4 py-2.5 rounded-lg border border-gray-700/50">
                  {profile?.name || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="text-white flex items-center bg-gray-800/50 px-4 py-2.5 rounded-lg border border-gray-700/50">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {profile?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <div className="text-white flex items-center bg-gray-800/50 px-4 py-2.5 rounded-lg border border-gray-700/50">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {profile?.phone || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] pointer-events-none" />

            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              AI Analysis & Skills
            </h2>

            {profile?.resume_url ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Extracted Skills</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm font-medium rounded-lg border border-purple-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No specific technical skills extracted yet.</p>
                  )}
                </div>

                {profile.experience && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Experience Summary</h3>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {profile.experience}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">Upload your resume to unlock AI matching capabilities</p>
                <p className="text-sm text-gray-500">Our system will automatically extract your skills and experience to match you with the best roles.</p>
              </div>
            )}
          </div>

        </div>

        <div className="space-y-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Resume</h2>

            {uploadStatus && (
              <div className={`p-3 rounded-lg mb-4 text-sm flex items-start ${uploadStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
                {uploadStatus.message}
              </div>
            )}

            {profile?.resume_url && (
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 mb-4">
                <div className="flex items-center overflow-hidden">
                  <div className="p-2 bg-blue-500/10 rounded-lg mr-3 flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">Current Resume</p>
                    <p className="text-xs text-gray-500">Uploaded</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2">
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`w-full flex items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${uploading
                    ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed'
                    : 'border-gray-700 hover:border-purple-500 hover:bg-purple-500/5 cursor-pointer'
                  }`}
              >
                <div className="text-center">
                  <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'text-gray-600 animate-pulse' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-white mb-1">
                    {uploading ? 'Analyzing Resume...' : 'Upload New Resume'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 5MB</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
