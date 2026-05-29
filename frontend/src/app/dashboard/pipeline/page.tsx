"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { candidateService, Candidate } from '@/services/candidate.service';
import { MessageSquare, MoreVertical, Edit2, GripVertical, Loader2 } from 'lucide-react';

const STAGES = [
  { id: 'applied', name: 'Applied' },
  { id: 'screening', name: 'Screening' },
  { id: 'interview', name: 'Interview' },
  { id: 'technical', name: 'Technical' },
  { id: 'hr', name: 'HR' },
  { id: 'offered', name: 'Offered' },
  { id: 'hired', name: 'Hired' },
  { id: 'rejected', name: 'Rejected' },
];

export default function PipelinePage() {
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getCandidates(),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => candidateService.updateStage(id, stage),
    onMutate: async ({ id, stage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['candidates'] });

      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData<Candidate[]>(['candidates']);

      // Optimistically update to the new value
      if (previousCandidates) {
        queryClient.setQueryData<Candidate[]>(['candidates'], (old) => 
          old?.map(c => c.id === id ? { ...c, stage } : c)
        );
      }

      // Return a context object with the snapshotted value
      return { previousCandidates };
    },
    onError: (err, newCandidate, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates'], context.previousCandidates);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;
    
    // Check if the stage actually changed
    const candidate = candidates?.find(c => c.id === draggableId);
    if (candidate && (candidate.stage || 'applied') !== newStage) {
      stageMutation.mutate({ id: draggableId, stage: newStage });
    }
  };

  const openNotes = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsNotesModalOpen(true);
  };

  // Group candidates by stage
  const groupedCandidates = STAGES.reduce((acc, stage) => {
    acc[stage.id] = candidates?.filter(c => (c.stage || 'applied') === stage.id) || [];
    return acc;
  }, {} as Record<string, Candidate[]>);

  if (!isMounted || isLoading) {
    return <div className="p-8 text-center text-gray-500 flex justify-center items-center h-full">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading pipeline...
    </div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Hiring Pipeline</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Track candidates through the recruitment process via drag and drop.
          </p>
        </div>
        {stageMutation.isPending && (
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Updating stage...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 min-w-max h-full items-start">
            {STAGES.map((stage) => (
              <div key={stage.id} className="w-80 flex flex-col max-h-full bg-gray-50/80 dark:bg-gray-800/50 rounded-lg shrink-0 border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm tracking-wide">{stage.name}</h3>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {groupedCandidates[stage.id]?.length || 0}
                  </span>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      {groupedCandidates[stage.id]?.map((candidate, index) => (
                        <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border transition-all ${
                                snapshot.isDragging 
                                  ? 'shadow-lg border-blue-400 dark:border-blue-500 rotate-2 z-50' 
                                  : 'shadow-sm border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2 group">
                                <div className="font-medium text-gray-900 dark:text-white text-sm flex items-center w-full">
                                  <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="truncate">{candidate.name}</span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate pl-6">{candidate.email}</div>
                              
                              <div className="pl-6">
                                {candidate.ai_score !== undefined && candidate.ai_score !== null && (
                                  <div className="mb-3">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                      candidate.ai_score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                      candidate.ai_score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                      AI Score: {candidate.ai_score}%
                                    </span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {candidate.skills?.slice(0, 3).map(skill => (
                                    <span key={skill} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-md font-medium truncate max-w-[80px]">
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills && candidate.skills.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] rounded-md">
                                      +{candidate.skills.length - 3}
                                    </span>
                                  )}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                                  <button onClick={() => openNotes(candidate)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center text-xs font-medium transition-colors">
                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                    Notes ({candidate.notes?.length || 0})
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {isNotesModalOpen && selectedCandidate && (
        <NotesModal 
          candidate={selectedCandidate} 
          onClose={() => {
            setIsNotesModalOpen(false);
            setSelectedCandidate(null);
          }} 
        />
      )}
    </div>
  );
}

function NotesModal({ candidate, onClose }: { candidate: Candidate, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  
  const mutation = useMutation({
    mutationFn: (newNote: string) => candidateService.addNote(candidate.id, newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setNote('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    mutation.mutate(note);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="inline-block transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-100 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh]">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
              Recruiter Notes
              <span className="ml-2 text-sm font-normal text-gray-500">({candidate.name})</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
              {candidate.notes && candidate.notes.length > 0 ? (
                candidate.notes.map((n, i) => (
                  <div key={i} className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    {n}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-8 flex flex-col items-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                  No notes added yet.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-auto">
              <div>
                <label className="sr-only">Add a note</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3.5 py-3 border resize-none transition-colors"
                  placeholder="Type a new recruiter note here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending || !note.trim()}
                  className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                  ) : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
