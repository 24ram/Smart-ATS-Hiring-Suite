"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offerService, Offer } from "@/services/offer.service";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Filter, 
  ExternalLink, 
  Send, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Clock,
  Eye,
  AlertCircle
} from "lucide-react";

export default function OffersDashboardPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: () => offerService.getOffers(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: any }) => 
      offerService.updateOffer(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] }); // Invalidate candidate timelines globally
      // Show success toast (simplification without external toast lib)
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offerService.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setOfferToDelete(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const filteredOffers = (offers || []).filter(offer => {
    const matchesSearch = offer.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          offer.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'viewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'declined': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'expired': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Offers</h1>
        <p className="text-gray-400">Manage candidate job offers and track their status.</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search candidates or job titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job Role</th>
                <th className="px-6 py-4 font-medium">Salary</th>
                <th className="px-6 py-4 font-medium">Joining Date</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/candidates/${offer.candidate_id}`} className="font-semibold text-white hover:text-purple-400 transition inline-flex items-center gap-1">
                        {offer.candidate_name} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {offer.job_title}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-300">
                      {offer.salary}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(offer.joining_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(offer.status)}`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Status Actions */}
                        {offer.status === 'draft' && (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'sent' })}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition mr-1"
                            title="Send Offer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {offer.status === 'sent' && (
                          <>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'accepted' })}
                              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition"
                              title="Accept Offer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'declined' })}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition mr-1"
                              title="Decline Offer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <div className="w-px h-4 bg-gray-700 mx-1"></div>

                        {/* Standard Actions */}
                        <button 
                          onClick={() => handleViewDetails(offer)}
                          className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setOfferToDelete(offer)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400 text-lg">No offers found</p>
                      <p className="text-sm text-gray-500 mt-1">Adjust filters or generate a new offer from a candidate profile</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Details Modal */}
      {isDetailsModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Offer Details
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedOffer.status)}`}>
                {selectedOffer.status}
              </span>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-gray-300">
              <div className="grid grid-cols-2 gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Candidate</p>
                  <p className="font-medium text-white">{selectedOffer.candidate_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Job Role</p>
                  <p className="font-medium text-white">{selectedOffer.job_title}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Salary</p>
                  <p className="font-medium text-white">{selectedOffer.salary}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Joining Date</p>
                  <p className="font-medium text-white">{new Date(selectedOffer.joining_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Created By</span>
                  <span className="text-white">{selectedOffer.created_by}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Created At</span>
                  <span className="text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(selectedOffer.created_at).toLocaleString()}
                  </span>
                </div>
                {selectedOffer.sent_at && (
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Sent At</span>
                    <span className="text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(selectedOffer.sent_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedOffer.viewed_at && (
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Viewed At</span>
                    <span className="text-purple-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(selectedOffer.viewed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedOffer.responded_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Responded At</span>
                    <span className={`${selectedOffer.status === 'accepted' ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                      <Clock className="w-3 h-3" /> {new Date(selectedOffer.responded_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-800/30 flex justify-end">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Delete Offer?</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to delete the offer for <span className="text-white font-medium">{offerToDelete.candidate_name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setOfferToDelete(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteMutation.mutate(offerToDelete.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex-1"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
