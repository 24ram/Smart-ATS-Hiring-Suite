"use client";

import React, { useEffect, useState } from 'react';
import { candidatePortalService } from '@/services/candidate-portal.service';
import { FileCheck, Building, DollarSign, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'accepted': 'bg-green-500/10 text-green-400 border-green-500/20',
    'rejected': 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const style = styles[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default function CandidateOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await candidatePortalService.getOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    try {
      setActionLoading(offerId);
      await candidatePortalService.respondToOffer(offerId, action);
      // Reload offers to reflect new status
      await loadOffers();
    } catch (error) {
      console.error(`Failed to ${action} offer`, error);
      alert(`Failed to respond to offer. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <FileCheck className="w-8 h-8 mr-3 text-green-400" />
          Job Offers
        </h1>
        <p className="text-gray-400 mt-2">Review and respond to your official job offers</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <div key={i} className="h-64 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
          <FileCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No offers yet</h3>
          <p className="text-gray-400 mb-6">You don't have any job offers at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-colors shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{offer.job_title}</h3>
                  <div className="flex items-center text-gray-400">
                    <Building className="w-4 h-4 mr-2" /> SmartATS
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={offer.status} />
                  <span className="text-xs text-gray-500 mt-2">
                    Sent {offer.created_at ? format(new Date(offer.created_at), 'MMM dd, yyyy') : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-center text-gray-400 mb-1 text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                    Salary Offer
                  </div>
                  <div className="text-xl font-bold text-white">{offer.salary || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-center text-gray-400 mb-1 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    Proposed Joining Date
                  </div>
                  <div className="text-xl font-bold text-white">
                    {offer.joining_date ? format(new Date(offer.joining_date), 'MMMM d, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>

              {offer.status.toLowerCase() === 'pending' ? (
                <div className="flex items-center gap-4 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => handleAction(offer.id, 'accepted')}
                    disabled={actionLoading === offer.id}
                    className="flex-1 flex items-center justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {actionLoading === offer.id ? 'Processing...' : 'Accept Offer'}
                  </button>
                  <button
                    onClick={() => handleAction(offer.id, 'rejected')}
                    disabled={actionLoading === offer.id}
                    className="flex-1 flex items-center justify-center py-3 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700 hover:border-red-500/50 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {actionLoading === offer.id ? 'Processing...' : 'Reject Offer'}
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-lg flex items-center justify-center font-medium ${
                  offer.status.toLowerCase() === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                  offer.status.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  'bg-gray-800 text-gray-400 border border-gray-700'
                }`}>
                  {offer.status.toLowerCase() === 'accepted' && <CheckCircle2 className="w-5 h-5 mr-2" />}
                  {offer.status.toLowerCase() === 'rejected' && <XCircle className="w-5 h-5 mr-2" />}
                  You have {offer.status.toLowerCase()} this offer.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
