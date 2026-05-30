"use client";

import React, { useEffect, useState } from 'react';
import { adminService, User } from '@/services/admin.service';
import { useAuth } from '@/providers/AuthProvider';
import { UserPlus, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHiringManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await adminService.getUsers('hiring_manager');
        setManagers(data);
      } catch (err) {
        console.error('Failed to fetch hiring managers', err);
        toast.error('Failed to load hiring managers list');
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminService.updateUserStatus(id, status);
      toast.success(`User ${status}`);
      setManagers(managers.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hiring Managers</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage hiring managers and approve new accounts.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Joined Date
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {managers.map((person) => (
                    <tr key={person.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-lg">
                              {person.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                            <div className="text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {person.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          person.role === 'admin' ? 'bg-red-100 text-red-800' :
                          person.role === 'hiring_manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {person.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {person.role || 'recruiter'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          person.status === 'approved' ? 'bg-green-100 text-green-800' :
                          person.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {person.status === 'pending' ? 'Pending Approval' : person.status ? person.status.charAt(0).toUpperCase() + person.status.slice(1) : 'Approved'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(person.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {person.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(person.id, 'approved')}
                              className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(person.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : person.status === 'approved' ? (
                          <button 
                            onClick={() => handleUpdateStatus(person.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Disable
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(person.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
