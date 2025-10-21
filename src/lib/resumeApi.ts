/**
 * Resume Builder API Functions
 * All resume-related API calls with proper authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'test123456789';

// Type definitions
export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template_name: string;
  career_objective: string | null;
  professional_summary: string | null;
  target_role: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  id: number;
  resume_id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  website_url: string | null;
}

export interface Education {
  id: number;
  resume_id: number;
  institute_name: string | null;
  degree: string | null;
  start_year: string | null;
  end_year: string | null;
  grade: string | null;
}

export interface Experience {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface Skill {
  id: number;
  resume_id: number;
  skill_name: string;
}

export interface Language {
  id: number;
  resume_id: number;
  language_name: string;
}

export interface Certification {
  id: number;
  resume_id: number;
  title: string;
  year: string | null;
}

export interface Project {
  id: number;
  resume_id: number;
  title: string;
  description: string | null;
  technologies: string | null;
  start_date: string | null;
  end_date: string | null;
  project_url: string | null;
  display_order: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  timestamp: string;
}

/**
 * Get headers with both API key and auth token
 */
function getHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP error')) {
      throw error;
    }
    // If JSON parsing failed
    throw new Error(`API request failed with status: ${response.status}`);
  }
}

// =====================================
//  RESUME MANAGEMENT
// =====================================

/**
 * Create a new resume
 */
export async function createResume(
  data: {
    title?: string;
    template_name?: string;
    career_objective?: string;
    profile_picture_url?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Get all user's resumes
 */
export async function getUserResumes(token: string, page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/api/resumes?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

/**
 * Get single resume with all details
 */
export async function getResume(resumeId: number, token: string) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  return handleResponse(response);
}

/**
 * Update resume basic info
 */
export async function updateResume(
  resumeId: number,
  data: {
    title?: string;
    template_name?: string;
    career_objective?: string;
    professional_summary?: string;
    target_role?: string;
    profile_picture_url?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Delete resume
 */
export async function deleteResume(resumeId: number, token: string) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  return handleResponse(response);
}

// =====================================
//  PERSONAL INFO
// =====================================

/**
 * Update personal info
 */
export async function updatePersonalInfo(
  resumeId: number,
  data: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
    website_url?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/personal-info`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// =====================================
//  EDUCATION
// =====================================

/**
 * Add education
 */
export async function addEducation(
  resumeId: number,
  data: {
    institute_name: string;
    degree: string;
    start_year?: string;
    end_year?: string;
    grade?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/education`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Update education
 */
export async function updateEducation(
  resumeId: number,
  educationId: number,
  data: {
    institute_name?: string;
    degree?: string;
    start_year?: string;
    end_year?: string;
    grade?: string;
  },
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/education/${educationId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/**
 * Delete education
 */
export async function deleteEducation(
  resumeId: number,
  educationId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/education/${educationId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  EXPERIENCE
// =====================================

/**
 * Add experience
 */
export async function addExperience(
  resumeId: number,
  data: {
    job_title: string;
    company_name: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/experience`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Update experience
 */
export async function updateExperience(
  resumeId: number,
  experienceId: number,
  data: {
    job_title?: string;
    company_name?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  },
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/experience/${experienceId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/**
 * Delete experience
 */
export async function deleteExperience(
  resumeId: number,
  experienceId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/experience/${experienceId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  SKILLS
// =====================================

/**
 * Add skill
 */
export async function addSkill(
  resumeId: number,
  data: { skill_name: string },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/skills`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Delete skill
 */
export async function deleteSkill(
  resumeId: number,
  skillId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/skills/${skillId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  LANGUAGES
// =====================================

/**
 * Add language
 */
export async function addLanguage(
  resumeId: number,
  data: { language_name: string },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/languages`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Delete language
 */
export async function deleteLanguage(
  resumeId: number,
  languageId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/languages/${languageId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  CERTIFICATIONS
// =====================================

/**
 * Add certification
 */
export async function addCertification(
  resumeId: number,
  data: { title: string; year?: string },
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/certifications`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/**
 * Update certification
 */
export async function updateCertification(
  resumeId: number,
  certificationId: number,
  data: { title?: string; year?: string },
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/certifications/${certificationId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/**
 * Delete certification
 */
export async function deleteCertification(
  resumeId: number,
  certificationId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/certifications/${certificationId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  PROJECTS
// =====================================

/**
 * Add project
 */
export async function addProject(
  resumeId: number,
  data: {
    title: string;
    description?: string;
    technologies?: string;
    start_date?: string;
    end_date?: string;
    project_url?: string;
    display_order?: number;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}/projects`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Update project
 */
export async function updateProject(
  resumeId: number,
  projectId: number,
  data: {
    title?: string;
    description?: string;
    technologies?: string;
    start_date?: string;
    end_date?: string;
    project_url?: string;
    display_order?: number;
  },
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/projects/${projectId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/**
 * Delete project
 */
export async function deleteProject(
  resumeId: number,
  projectId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/resumes/${resumeId}/projects/${projectId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

// =====================================
//  COVER LETTERS
// =====================================

export interface CoverLetter {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  tone: string;
  letter_text: string | null;
  created_at: string;
}

/**
 * Create a cover letter
 */
export async function createCoverLetter(
  data: {
    resume_id: number;
    job_title?: string;
    company_name?: string;
    tone?: string;
    letter_text?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/cover-letters`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Get all cover letters for a resume
 */
export async function getCoverLetters(resumeId: number, token: string) {
  const response = await fetch(
    `${API_URL}/api/cover-letters/resume/${resumeId}`,
    {
      method: 'GET',
      headers: getHeaders(token),
    }
  );

  return handleResponse(response);
}

/**
 * Get a single cover letter
 */
export async function getCoverLetter(coverLetterId: number, token: string) {
  const response = await fetch(`${API_URL}/api/cover-letters/${coverLetterId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  return handleResponse(response);
}

/**
 * Update a cover letter
 */
export async function updateCoverLetter(
  coverLetterId: number,
  data: {
    job_title?: string;
    company_name?: string;
    tone?: string;
    letter_text?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/api/cover-letters/${coverLetterId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

/**
 * Delete a cover letter
 */
export async function deleteCoverLetter(coverLetterId: number, token: string) {
  const response = await fetch(`${API_URL}/api/cover-letters/${coverLetterId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  return handleResponse(response);
}

