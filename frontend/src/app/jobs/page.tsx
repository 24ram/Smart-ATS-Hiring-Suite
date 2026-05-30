"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, ChevronRight } from "lucide-react";

export default function PublicJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: () => jobService.getPublicJobs(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Filter by search term
  const openJobs = jobs ?? [];

  const filteredJobs = openJobs.filter((job) => {
    const search = (searchTerm ?? "").toLowerCase();

    return (
      (job?.title ?? "").toLowerCase().includes(search) ||
      (job?.department ?? "").toLowerCase().includes(search) ||
      (job?.location ?? "").toLowerCase().includes(search) ||
      (job?.company ?? "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="font-bold text-white text-lg">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight">SmartATS<span className="text-purple-400">.</span></span>
            </div>
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">
              Recruiter Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800 bg-gray-900/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[100px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-24 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
            Join Our Mission
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            We are looking for passionate individuals to help us build the future. Explore our open positions below.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for roles, departments, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Open Positions</h2>
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-sm font-semibold">
            {filteredJobs.length} Roles
          </span>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative overflow-hidden shadow-sm">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.employment_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-800">
                    <div className="text-sm font-medium text-gray-300">
                      {job.salary_range}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <h3 className="text-xl font-medium text-gray-300 mb-2">No positions found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SmartATS Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
