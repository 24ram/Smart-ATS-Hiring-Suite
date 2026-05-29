"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, Job } from '@/services/job.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, X, ChevronDown } from 'lucide-react';
import { ALL_JOB_ROLES } from '@/constants/jobRoles';

const LOCATION_SUGGESTIONS = [
  "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune",
  "Delhi", "Remote", "New York", "London", "San Francisco"
];

const SALARY_RANGES = ["3-5 LPA", "5-8 LPA", "8-12 LPA", "12-20 LPA", "20-35 LPA", "35+ LPA"];
const EXPERIENCE_LEVELS = ["Fresher", "1-2 Years", "3-5 Years", "5-8 Years", "8+ Years"];
const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "HR", "Sales", "Finance", "Operations"];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

function AutocompleteInput({ label, value, onChange, options, placeholder, required }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredOptions = () => {
    const search = value.toLowerCase().trim();
    if (!search) return [];

    const startsWith: string[] = [];
    const includes: string[] = [];

    for (const opt of options) {
      const lowerOpt = opt.toLowerCase();
      if (lowerOpt.startsWith(search)) {
        startsWith.push(opt);
      } else if (lowerOpt.includes(search)) {
        includes.push(opt);
      }
    }

    return [...startsWith, ...includes].slice(0, 8);
  };

  const filteredOptions = getFilteredOptions();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        onChange(filteredOptions[activeIndex]);
        setIsOpen(false);
      } else if (filteredOptions.length > 0) {
        onChange(filteredOptions[0]);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && value && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden transition-all duration-200 ease-in-out">
          {filteredOptions.map((opt, index) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                index === activeIndex
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

export function CreateJobModal({ isOpen, onClose, job }: CreateJobModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company: '',
    employment_type: 'full_time',
    department: '',
    experience_level: '',
    status: 'draft',
    salary_range: '',
    description: '',
    requirements: ''
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || '',
        employment_type: job.employment_type || 'full_time',
        department: job.department || '',
        experience_level: job.experience_level || '',
        status: job.status || 'published',
        salary_range: job.salary_range || '',
        description: job.description || '',
        requirements: job.requirements?.join('\n') || ''
      });
      setTitleSearch(job.title || '');
      setLocationSearch(job.location || '');
      setSkills(job.skills || []);
    } else {
      resetForm();
    }
  }, [job, isOpen]);

  const resetForm = () => {
    setFormData({
      company: '', employment_type: 'full_time', department: '', 
      experience_level: '', status: 'draft', salary_range: '',
      description: '', requirements: ''
    });
    setTitleSearch('');
    setLocationSearch('');
    setSkills([]);
    setSkillInput('');
  };

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        title: titleSearch,
        location: locationSearch,
        skills,
        requirements: data.requirements.split('\n').filter((r: string) => r.trim() !== '')
      };
      return job ? jobService.updateJob(job.id, payload) : jobService.createJob(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      resetForm();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl md:max-w-4xl p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {job ? 'Edit Job Posting' : 'Create New Job Posting'}
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fill out the details below to structure a clear, attractive job post.
            </p>
          </DialogHeader>
          
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <AutocompleteInput
                label="Job Title"
                value={titleSearch}
                onChange={setTitleSearch}
                options={ALL_JOB_ROLES}
                placeholder="e.g. Senior Software Engineer"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company <span className="text-red-500">*</span></label>
                <input
                  type="text" name="company" required
                  value={formData.company} onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Company Name"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                <div className="relative">
                  <select
                    name="department" value={formData.department} onChange={handleChange}
                    className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 pr-10 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <AutocompleteInput
                label="Location"
                value={locationSearch}
                onChange={setLocationSearch}
                options={LOCATION_SUGGESTIONS}
                placeholder="e.g. Bangalore, Remote"
                required
              />

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Employment Type</label>
                <div className="relative">
                  <select
                    name="employment_type" value={formData.employment_type} onChange={handleChange}
                    className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 pr-10 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {EMPLOYMENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience Level</label>
                <div className="relative">
                  <select
                    name="experience_level" value={formData.experience_level} onChange={handleChange}
                    className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 pr-10 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="" disabled>Select Experience</option>
                    {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Salary Range</label>
                <div className="relative">
                  <select
                    name="salary_range" value={formData.salary_range} onChange={handleChange}
                    className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 pr-10 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Undisclosed</option>
                    {SALARY_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Visibility Status</label>
                <div className="relative">
                  <select
                    name="status" value={formData.status} onChange={handleChange}
                    className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 pr-10 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Required Skills</label>
              <div className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-colors min-h-[44px] flex flex-wrap gap-2 items-center">
                {skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-500 focus:outline-none transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="flex-1 min-w-[120px] bg-transparent text-sm dark:text-white focus:outline-none py-0.5"
                  placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description" required rows={5}
                value={formData.description} onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                placeholder="Describe the job role and responsibilities..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements (One per line)</label>
              <textarea
                name="requirements" rows={5}
                value={formData.requirements} onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors leading-relaxed"
                placeholder="5+ years experience in React&#10;Strong problem solving skills&#10;Experience with AWS"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
            <button
              type="button" onClick={onClose} disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={mutation.isPending || !titleSearch || !locationSearch || !formData.company || !formData.description}
              className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : job ? 'Update Job' : 'Publish Job'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
