'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  createResume, 
  getUserResumes, 
  getResume, 
  updateResume, 
  deleteResume,
  updatePersonalInfo,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
  addLanguage,
  deleteLanguage,
  addCertification,
  updateCertification,
  deleteCertification,
  addProject,
  updateProject,
  deleteProject,
  createCoverLetter,
  getCoverLetters,
  updateCoverLetter,
  deleteCoverLetter,
  type Resume,
  type PersonalInfo,
  type Education,
  type Experience,
  type Skill,
  type Language,
  type Certification,
  type Project,
  type CoverLetter
} from '@/lib/resumeApi';

interface ResumeDetail extends Resume {
  personal_info?: PersonalInfo | null;
  education?: Education[];
  experience?: Experience[];
  skills?: Skill[];
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
}

interface ResumeContextType {
  // State
  resumes: Resume[];
  currentResume: ResumeDetail | null;
  selectedTemplate: string | null;
  isLoading: boolean;
  isSaving: boolean;
  coverLetters: CoverLetter[];
  
  // Resume management
  fetchUserResumes: (token: string) => Promise<void>;
  fetchResume: (resumeId: number, token: string) => Promise<void>;
  createNewResume: (data: { title?: string; template_name?: string; career_objective?: string }, token: string) => Promise<Resume | null>;
  updateResumeBasic: (resumeId: number, data: Partial<Resume>, token: string) => Promise<void>;
  deleteUserResume: (resumeId: number, token: string) => Promise<void>;
  setSelectedTemplate: (templateId: string | null) => void;
  setCurrentResume: (resume: ResumeDetail | null) => void;
  
  // Personal info
  updatePersonalData: (resumeId: number, data: Partial<PersonalInfo>, token: string) => Promise<void>;
  
  // Education
  addEducationEntry: (resumeId: number, data: Omit<Education, 'id' | 'resume_id'>, token: string) => Promise<void>;
  updateEducationEntry: (resumeId: number, educationId: number, data: Partial<Education>, token: string) => Promise<void>;
  deleteEducationEntry: (resumeId: number, educationId: number, token: string) => Promise<void>;
  
  // Experience
  addExperienceEntry: (resumeId: number, data: Omit<Experience, 'id' | 'resume_id'>, token: string) => Promise<void>;
  updateExperienceEntry: (resumeId: number, experienceId: number, data: Partial<Experience>, token: string) => Promise<void>;
  deleteExperienceEntry: (resumeId: number, experienceId: number, token: string) => Promise<void>;
  
  // Skills
  addSkillEntry: (resumeId: number, skillName: string, token: string) => Promise<void>;
  deleteSkillEntry: (resumeId: number, skillId: number, token: string) => Promise<void>;
  
  // Languages
  addLanguageEntry: (resumeId: number, languageName: string, token: string) => Promise<void>;
  deleteLanguageEntry: (resumeId: number, languageId: number, token: string) => Promise<void>;
  
  // Certifications
  addCertificationEntry: (resumeId: number, data: { title: string; year?: string }, token: string) => Promise<void>;
  updateCertificationEntry: (resumeId: number, certificationId: number, data: Partial<Certification>, token: string) => Promise<void>;
  deleteCertificationEntry: (resumeId: number, certificationId: number, token: string) => Promise<void>;
  
  // Projects
  addProjectEntry: (resumeId: number, data: Omit<Project, 'id' | 'resume_id' | 'created_at'>, token: string) => Promise<void>;
  updateProjectEntry: (resumeId: number, projectId: number, data: Partial<Project>, token: string) => Promise<void>;
  deleteProjectEntry: (resumeId: number, projectId: number, token: string) => Promise<void>;
  
  // Cover Letters
  fetchCoverLetters: (resumeId: number, token: string) => Promise<void>;
  createNewCoverLetter: (data: { resume_id: number; job_title?: string; company_name?: string; tone?: string; letter_text?: string }, token: string) => Promise<CoverLetter | null>;
  updateCoverLetterEntry: (coverLetterId: number, data: Partial<CoverLetter>, token: string) => Promise<void>;
  deleteCoverLetterEntry: (coverLetterId: number, token: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<ResumeDetail | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  // Fetch user's resumes
  const fetchUserResumes = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const response = await getUserResumes(token);
      if (response.success && response.data) {
        const data = response.data as { resumes: Resume[] };
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single resume with all details
  const fetchResume = useCallback(async (resumeId: number, token: string) => {
    setIsLoading(true);
    try {
      const response = await getResume(resumeId, token);
      if (response.success && response.data) {
        const data = response.data as { resume: ResumeDetail };
        setCurrentResume(data.resume);
        setSelectedTemplate(data.resume.template_name);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new resume
  const createNewResume = useCallback(async (
    data: { title?: string; template_name?: string; career_objective?: string },
    token: string
  ): Promise<Resume | null> => {
    setIsSaving(true);
    try {
      const response = await createResume(data, token);
      if (response.success && response.data) {
        const resumeData = response.data as { resume: Resume };
        const newResume = resumeData.resume;
        setResumes(prev => [newResume, ...prev]);
        return newResume;
      }
      return null;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update resume basic info
  const updateResumeBasic = useCallback(async (
    resumeId: number,
    data: Partial<Resume>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values and only send defined strings
      const cleanData: {
        title?: string;
        template_name?: string;
        career_objective?: string;
        professional_summary?: string;
        target_role?: string;
        profile_picture_url?: string;
      } = {};
      
      if (data.title !== undefined && data.title !== null) cleanData.title = data.title;
      if (data.template_name !== undefined && data.template_name !== null) cleanData.template_name = data.template_name;
      if (data.career_objective !== undefined && data.career_objective !== null) cleanData.career_objective = data.career_objective;
      if (data.professional_summary !== undefined && data.professional_summary !== null) cleanData.professional_summary = data.professional_summary;
      if (data.target_role !== undefined && data.target_role !== null) cleanData.target_role = data.target_role;
      if (data.profile_picture_url !== undefined && data.profile_picture_url !== null) cleanData.profile_picture_url = data.profile_picture_url;
      
      const response = await updateResume(resumeId, cleanData, token);
      if (response.success && response.data) {
        const updatedData = response.data as { resume: Resume };
        // Update in list
        setResumes(prev => prev.map(r => r.id === resumeId ? updatedData.resume : r));
        // Update current if it's the one being edited
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? { ...prev, ...updatedData.resume } : null);
        }
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Delete resume
  const deleteUserResume = useCallback(async (resumeId: number, token: string) => {
    setIsSaving(true);
    try {
      await deleteResume(resumeId, token);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      if (currentResume?.id === resumeId) {
        setCurrentResume(null);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Update personal info
  const updatePersonalData = useCallback(async (
    resumeId: number,
    data: Partial<PersonalInfo>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        full_name?: string;
        email?: string;
        phone?: string;
        city?: string;
        address?: string;
        linkedin_url?: string;
        portfolio_url?: string;
        github_url?: string;
        website_url?: string;
      } = {};
      
      if (data.full_name !== undefined && data.full_name !== null) cleanData.full_name = data.full_name;
      if (data.email !== undefined && data.email !== null) cleanData.email = data.email;
      if (data.phone !== undefined && data.phone !== null) cleanData.phone = data.phone;
      if (data.city !== undefined && data.city !== null) cleanData.city = data.city;
      if (data.address !== undefined && data.address !== null) cleanData.address = data.address;
      if (data.linkedin_url !== undefined && data.linkedin_url !== null) cleanData.linkedin_url = data.linkedin_url;
      if (data.portfolio_url !== undefined && data.portfolio_url !== null) cleanData.portfolio_url = data.portfolio_url;
      if (data.github_url !== undefined && data.github_url !== null) cleanData.github_url = data.github_url;
      if (data.website_url !== undefined && data.website_url !== null) cleanData.website_url = data.website_url;
      
      const response = await updatePersonalInfo(resumeId, cleanData, token);
      if (response.success && response.data) {
        const personalData = response.data as { personal_info: PersonalInfo };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? { ...prev, personal_info: personalData.personal_info } : null);
        }
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Education operations
  const addEducationEntry = useCallback(async (
    resumeId: number,
    data: Omit<Education, 'id' | 'resume_id'>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      const cleanData: {
        institute_name: string;
        degree: string;
        start_year?: string;
        end_year?: string;
        grade?: string;
      } = {
        institute_name: data.institute_name || '',
        degree: data.degree || '',
        start_year: data.start_year || undefined,
        end_year: data.end_year || undefined,
        grade: data.grade || undefined,
      };
      
      const response = await addEducation(resumeId, cleanData, token);
      if (response.success && response.data) {
        const eduData = response.data as { education: Education };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            education: [...(prev.education || []), eduData.education]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const updateEducationEntry = useCallback(async (
    resumeId: number,
    educationId: number,
    data: Partial<Education>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        institute_name?: string;
        degree?: string;
        start_year?: string;
        end_year?: string;
        grade?: string;
      } = {};
      
      if (data.institute_name !== undefined && data.institute_name !== null) cleanData.institute_name = data.institute_name;
      if (data.degree !== undefined && data.degree !== null) cleanData.degree = data.degree;
      if (data.start_year !== undefined && data.start_year !== null) cleanData.start_year = data.start_year;
      if (data.end_year !== undefined && data.end_year !== null) cleanData.end_year = data.end_year;
      if (data.grade !== undefined && data.grade !== null) cleanData.grade = data.grade;
      
      const response = await updateEducation(resumeId, educationId, cleanData, token);
      if (response.success && response.data) {
        const eduData = response.data as { education: Education };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            education: prev.education?.map(e => e.id === educationId ? eduData.education : e) || []
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteEducationEntry = useCallback(async (
    resumeId: number,
    educationId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteEducation(resumeId, educationId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          education: prev.education?.filter(e => e.id !== educationId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Experience operations
  const addExperienceEntry = useCallback(async (
    resumeId: number,
    data: Omit<Experience, 'id' | 'resume_id'>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      const cleanData: {
        job_title: string;
        company_name: string;
        start_date?: string;
        end_date?: string;
        description?: string;
      } = {
        job_title: data.job_title || '',
        company_name: data.company_name || '',
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        description: data.description || undefined,
      };
      
      const response = await addExperience(resumeId, cleanData, token);
      if (response.success && response.data) {
        const expData = response.data as { experience: Experience };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            experience: [...(prev.experience || []), expData.experience]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const updateExperienceEntry = useCallback(async (
    resumeId: number,
    experienceId: number,
    data: Partial<Experience>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        job_title?: string;
        company_name?: string;
        start_date?: string;
        end_date?: string;
        description?: string;
      } = {};
      
      if (data.job_title !== undefined && data.job_title !== null) cleanData.job_title = data.job_title;
      if (data.company_name !== undefined && data.company_name !== null) cleanData.company_name = data.company_name;
      if (data.start_date !== undefined && data.start_date !== null) cleanData.start_date = data.start_date;
      if (data.end_date !== undefined && data.end_date !== null) cleanData.end_date = data.end_date;
      if (data.description !== undefined && data.description !== null) cleanData.description = data.description;
      
      const response = await updateExperience(resumeId, experienceId, cleanData, token);
      if (response.success && response.data) {
        const expData = response.data as { experience: Experience };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            experience: prev.experience?.map(e => e.id === experienceId ? expData.experience : e) || []
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteExperienceEntry = useCallback(async (
    resumeId: number,
    experienceId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteExperience(resumeId, experienceId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          experience: prev.experience?.filter(e => e.id !== experienceId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Skills operations
  const addSkillEntry = useCallback(async (
    resumeId: number,
    skillName: string,
    token: string
  ) => {
    setIsSaving(true);
    try {
      const response = await addSkill(resumeId, { skill_name: skillName }, token);
      if (response.success && response.data) {
        const skillData = response.data as { skill: Skill };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            skills: [...(prev.skills || []), skillData.skill]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteSkillEntry = useCallback(async (
    resumeId: number,
    skillId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteSkill(resumeId, skillId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          skills: prev.skills?.filter(s => s.id !== skillId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Languages operations
  const addLanguageEntry = useCallback(async (
    resumeId: number,
    languageName: string,
    token: string
  ) => {
    setIsSaving(true);
    try {
      const response = await addLanguage(resumeId, { language_name: languageName }, token);
      if (response.success && response.data) {
        const langData = response.data as { language: Language };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            languages: [...(prev.languages || []), langData.language]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding language:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteLanguageEntry = useCallback(async (
    resumeId: number,
    languageId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteLanguage(resumeId, languageId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          languages: prev.languages?.filter(l => l.id !== languageId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Certifications operations
  const addCertificationEntry = useCallback(async (
    resumeId: number,
    data: { title: string; year?: string },
    token: string
  ) => {
    setIsSaving(true);
    try {
      const response = await addCertification(resumeId, data, token);
      if (response.success && response.data) {
        const certData = response.data as { certification: Certification };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            certifications: [...(prev.certifications || []), certData.certification]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const updateCertificationEntry = useCallback(async (
    resumeId: number,
    certificationId: number,
    data: Partial<Certification>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        title?: string;
        year?: string;
      } = {};
      
      if (data.title !== undefined && data.title !== null) cleanData.title = data.title;
      if (data.year !== undefined && data.year !== null) cleanData.year = data.year;
      
      const response = await updateCertification(resumeId, certificationId, cleanData, token);
      if (response.success && response.data) {
        const certData = response.data as { certification: Certification };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            certifications: prev.certifications?.map(c => c.id === certificationId ? certData.certification : c) || []
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating certification:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteCertificationEntry = useCallback(async (
    resumeId: number,
    certificationId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteCertification(resumeId, certificationId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          certifications: prev.certifications?.filter(c => c.id !== certificationId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Projects operations
  const addProjectEntry = useCallback(async (
    resumeId: number,
    data: Omit<Project, 'id' | 'resume_id' | 'created_at'>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      const cleanData: {
        title: string;
        description?: string;
        technologies?: string;
        start_date?: string;
        end_date?: string;
        project_url?: string;
        display_order?: number;
      } = {
        title: data.title || '',
        description: data.description || undefined,
        technologies: data.technologies || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        project_url: data.project_url || undefined,
        display_order: data.display_order || 0,
      };
      
      const response = await addProject(resumeId, cleanData, token);
      if (response.success && response.data) {
        const projectData = response.data as { project: Project };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            projects: [...(prev.projects || []), projectData.project]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const updateProjectEntry = useCallback(async (
    resumeId: number,
    projectId: number,
    data: Partial<Project>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        title?: string;
        description?: string;
        technologies?: string;
        start_date?: string;
        end_date?: string;
        project_url?: string;
        display_order?: number;
      } = {};
      
      if (data.title !== undefined && data.title !== null) cleanData.title = data.title;
      if (data.description !== undefined && data.description !== null) cleanData.description = data.description;
      if (data.technologies !== undefined && data.technologies !== null) cleanData.technologies = data.technologies;
      if (data.start_date !== undefined && data.start_date !== null) cleanData.start_date = data.start_date;
      if (data.end_date !== undefined && data.end_date !== null) cleanData.end_date = data.end_date;
      if (data.project_url !== undefined && data.project_url !== null) cleanData.project_url = data.project_url;
      if (data.display_order !== undefined && data.display_order !== null) cleanData.display_order = data.display_order;
      
      const response = await updateProject(resumeId, projectId, cleanData, token);
      if (response.success && response.data) {
        const projectData = response.data as { project: Project };
        if (currentResume?.id === resumeId) {
          setCurrentResume(prev => prev ? {
            ...prev,
            projects: prev.projects?.map(p => p.id === projectId ? projectData.project : p) || []
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  const deleteProjectEntry = useCallback(async (
    resumeId: number,
    projectId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteProject(resumeId, projectId, token);
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => prev ? {
          ...prev,
          projects: prev.projects?.filter(p => p.id !== projectId) || []
        } : null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentResume]);

  // Cover Letter operations
  const fetchCoverLetters = useCallback(async (resumeId: number, token: string) => {
    setIsLoading(true);
    try {
      const response = await getCoverLetters(resumeId, token);
      if (response.success && response.data) {
        const data = response.data as { cover_letters: CoverLetter[] };
        setCoverLetters(data.cover_letters);
      }
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewCoverLetter = useCallback(async (
    data: { resume_id: number; job_title?: string; company_name?: string; tone?: string; letter_text?: string },
    token: string
  ): Promise<CoverLetter | null> => {
    setIsSaving(true);
    try {
      const response = await createCoverLetter(data, token);
      if (response.success && response.data) {
        const coverLetterData = response.data as { cover_letter: CoverLetter };
        const newCoverLetter = coverLetterData.cover_letter;
        setCoverLetters(prev => [newCoverLetter, ...prev]);
        return newCoverLetter;
      }
      return null;
    } catch (error) {
      console.error('Error creating cover letter:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateCoverLetterEntry = useCallback(async (
    coverLetterId: number,
    data: Partial<CoverLetter>,
    token: string
  ) => {
    setIsSaving(true);
    try {
      // Filter out null values
      const cleanData: {
        job_title?: string;
        company_name?: string;
        tone?: string;
        letter_text?: string;
      } = {};
      
      if (data.job_title !== undefined && data.job_title !== null) cleanData.job_title = data.job_title;
      if (data.company_name !== undefined && data.company_name !== null) cleanData.company_name = data.company_name;
      if (data.tone !== undefined && data.tone !== null) cleanData.tone = data.tone;
      if (data.letter_text !== undefined && data.letter_text !== null) cleanData.letter_text = data.letter_text;
      
      const response = await updateCoverLetter(coverLetterId, cleanData, token);
      if (response.success && response.data) {
        const coverLetterData = response.data as { cover_letter: CoverLetter };
        setCoverLetters(prev => prev.map(cl => cl.id === coverLetterId ? coverLetterData.cover_letter : cl));
      }
    } catch (error) {
      console.error('Error updating cover letter:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteCoverLetterEntry = useCallback(async (
    coverLetterId: number,
    token: string
  ) => {
    setIsSaving(true);
    try {
      await deleteCoverLetter(coverLetterId, token);
      setCoverLetters(prev => prev.filter(cl => cl.id !== coverLetterId));
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        currentResume,
        selectedTemplate,
        isLoading,
        isSaving,
        coverLetters,
        fetchUserResumes,
        fetchResume,
        createNewResume,
        updateResumeBasic,
        deleteUserResume,
        setSelectedTemplate,
        setCurrentResume,
        updatePersonalData,
        addEducationEntry,
        updateEducationEntry,
        deleteEducationEntry,
        addExperienceEntry,
        updateExperienceEntry,
        deleteExperienceEntry,
        addSkillEntry,
        deleteSkillEntry,
        addLanguageEntry,
        deleteLanguageEntry,
        addCertificationEntry,
        updateCertificationEntry,
        deleteCertificationEntry,
        addProjectEntry,
        updateProjectEntry,
        deleteProjectEntry,
        fetchCoverLetters,
        createNewCoverLetter,
        updateCoverLetterEntry,
        deleteCoverLetterEntry,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
}

