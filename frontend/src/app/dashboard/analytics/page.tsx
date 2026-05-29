"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { offerService } from '@/services/offer.service';
import { useAuth } from '@/providers/AuthProvider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Users, Briefcase, CheckCircle, XCircle, BrainCircuit, Loader2, Clock, Star, Inbox, FileText, Send, CheckCircle2 } from 'lucide-react';

interface OverviewStats {
  total_candidates: number;
  total_jobs: number;
  total_applications: number;
  hired_candidates: number;
  rejected_candidates: number;
  average_ai_score: number;
  average_interview_score: number;
}

interface PipelineStat {
  stage: string;
  count: number;
}

interface AiScoreStat {
  range: string;
  count: number;
}

interface RecentActivity {
  id: string;
  name: string;
  email: string;
  stage: string;
  created_at: string;
}

interface RecommendationStat {
  name: string;
  count: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: overview, isLoading: loadingOverview } = useQuery<OverviewStats>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data;
    }
  });

  const { data: pipeline, isLoading: loadingPipeline } = useQuery<PipelineStat[]>({
    queryKey: ['analytics-pipeline'],
    queryFn: async () => {
      const res = await api.get('/analytics/pipeline');
      return res.data;
    }
  });

  const { data: aiScores, isLoading: loadingScores } = useQuery<AiScoreStat[]>({
    queryKey: ['analytics-ai-scores'],
    queryFn: async () => {
      const res = await api.get('/analytics/ai-scores');
      return res.data;
    }
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ['analytics-recent-activity'],
    queryFn: async () => {
      const res = await api.get('/analytics/recent-activity');
      return res.data;
    }
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery<RecommendationStat[]>({
    queryKey: ['analytics-recommendations'],
    queryFn: async () => {
      const res = await api.get('/analytics/recommendations');
      return res.data;
    }
  });

  const { data: offers, isLoading: loadingOffers } = useQuery({
    queryKey: ['analytics-offers'],
    queryFn: () => offerService.getOffers(),
  });

  const offerStats = {
    total: offers?.length || 0,
    sent: offers?.filter(o => o.status === 'sent').length || 0,
    accepted: offers?.filter(o => o.status === 'accepted').length || 0,
    declined: offers?.filter(o => o.status === 'declined').length || 0,
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const REC_COLORS = ['#16a34a', '#10b981', '#6b7280', '#f97316', '#dc2626']; // green, emerald, gray, orange, red

  const StatCard = ({ title, value, icon: Icon, isLoading }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : value}
        </h3>
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Overview</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Monitor your hiring performance and candidate pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard title="Total Candidates" value={overview?.total_candidates} icon={Users} isLoading={loadingOverview} />
        <StatCard title="Total Jobs" value={overview?.total_jobs} icon={Briefcase} isLoading={loadingOverview} />
        <StatCard title="Applications" value={overview?.total_applications} icon={Inbox} isLoading={loadingOverview} />
        <StatCard title="Hired" value={overview?.hired_candidates} icon={CheckCircle} isLoading={loadingOverview} />
        <StatCard title="Rejected" value={overview?.rejected_candidates} icon={XCircle} isLoading={loadingOverview} />
        <StatCard title="Avg AI Score" value={`${overview?.average_ai_score || 0}%`} icon={BrainCircuit} isLoading={loadingOverview} />
        <StatCard title="Avg Interview" value={`${overview?.average_interview_score || 0}/5.0`} icon={Star} isLoading={loadingOverview} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Offer Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Offers" value={offerStats.total} icon={FileText} isLoading={loadingOffers} />
          <StatCard title="Sent Offers" value={offerStats.sent} icon={Send} isLoading={loadingOffers} />
          <StatCard title="Accepted Offers" value={offerStats.accepted} icon={CheckCircle2} isLoading={loadingOffers} />
          <StatCard title="Declined Offers" value={offerStats.declined} icon={XCircle} isLoading={loadingOffers} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Pipeline Distribution</h3>
          {loadingPipeline ? (
            <div className="h-72 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="stage" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">AI Score Distribution</h3>
          {loadingScores ? (
            <div className="h-72 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiScores}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="range"
                  >
                    {aiScores?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Recommendations</h3>
          {loadingRecs ? (
            <div className="h-72 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recommendations} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {
                      recommendations?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={REC_COLORS[index % REC_COLORS.length]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Recent Activity
        </h3>
        
        {loadingActivity ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : recentActivity && recentActivity.length > 0 ? (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map((candidate) => (
                <li key={candidate.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                        {candidate.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {candidate.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                        {candidate.stage || 'applied'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 text-sm">No recent activity found.</div>
        )}
      </div>
    </div>
  );
}
