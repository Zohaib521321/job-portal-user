'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProgressStepper from '@/components/ProgressStepper';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ResumeEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, token, isLoading: authLoading } = useAuth();
  const {
    currentResume,
    isLoading: resumeLoading,
    isSaving,
    fetchResume,
    updateResumeBasic,
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
  } = useResume();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(0.75);
  const [templateHTML, setTemplateHTML] = useState('');

  const resumeId = parseInt(id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load resume data
  useEffect(() => {
    if (user && token && resumeId) {
      fetchResume(resumeId, token).catch(error => {
        console.error('Failed to fetch resume:', error);
        alert('Failed to load resume');
        router.push('/resume-builder');
      });
    }
  }, [resumeId, user, token, fetchResume, router]);

  // Load template HTML when resume is loaded
  useEffect(() => {
    if (currentResume?.template_name) {
      fetch(`/templates/${currentResume.template_name}/index.html`)
        .then(response => response.text())
        .then(html => setTemplateHTML(html))
        .catch(error => console.error('Error loading template:', error));
    }
  }, [currentResume?.template_name]);

  // Generate populated template HTML - ONLY show sections with data
  const getPopulatedHTML = useCallback(() => {
    if (!templateHTML || !currentResume) return templateHTML;

    let populatedHTML = templateHTML;

    // Replace personal info ONLY if provided
    const personalInfo = currentResume.personal_info;
    if (personalInfo?.full_name) {
      populatedHTML = populatedHTML.replace(
        /<h1>.*?<\/h1>/,
        `<h1>${personalInfo.full_name}</h1>`
      );
    } else {
      // Hide name if not provided
      populatedHTML = populatedHTML.replace(/<h1>.*?<\/h1>/, '');
    }
    
    // Build contact info with clickable links
    if (personalInfo) {
      const contactParts = [];
      if (personalInfo.email) contactParts.push(`<a href="mailto:${personalInfo.email}">${personalInfo.email}</a>`);
      if (personalInfo.phone) contactParts.push(`<a href="tel:${personalInfo.phone.replace(/[^\d+]/g, '')}">${personalInfo.phone}</a>`);
      if (personalInfo.city) contactParts.push(personalInfo.city);
      const contactLine1 = contactParts.join(' | ');
      
      const addressParts = [];
      if (personalInfo.address) addressParts.push(personalInfo.address);
      const contactLine2 = addressParts.join(' | ');
      
      if (contactLine1 || contactLine2) {
        const contactHTML = `${contactLine1 ? `<p>${contactLine1}</p>` : ''}${contactLine2 ? `<p>${contactLine2}</p>` : ''}`;
        populatedHTML = populatedHTML.replace(
          /<div class="contact-info">[\s\S]*?<\/div>/,
          `<div class="contact-info">${contactHTML}</div>`
        );
      } else {
        populatedHTML = populatedHTML.replace(/<div class="contact-info">[\s\S]*?<\/div>/, '');
      }
      
      // Remove any existing social links first to avoid duplication
      populatedHTML = populatedHTML.replace(/<div class="social-links">[\s\S]*?<\/div>\n?/, '');
      
      // Add social links if any exist
      const socialLinks = [];
      if (personalInfo.linkedin_url) socialLinks.push(`<a href="${personalInfo.linkedin_url}" target="_blank">LinkedIn</a>`);
      if (personalInfo.portfolio_url) socialLinks.push(`<a href="${personalInfo.portfolio_url}" target="_blank">Portfolio</a>`);
      if (personalInfo.github_url) socialLinks.push(`<a href="${personalInfo.github_url}" target="_blank">GitHub</a>`);
      if (personalInfo.website_url) socialLinks.push(`<a href="${personalInfo.website_url}" target="_blank">Website</a>`);
      
      if (socialLinks.length > 0) {
        const socialHTML = `<div class="social-links">${socialLinks.join(' ')}</div>`;
        // Insert after contact-info or after h1 if contact-info doesn't exist
        if (populatedHTML.includes('class="contact-info"')) {
          populatedHTML = populatedHTML.replace(
            /(<div class="contact-info">[\s\S]*?<\/div>)/,
            `$1\n    ${socialHTML}`
          );
        } else if (populatedHTML.includes('class="target-role"')) {
          populatedHTML = populatedHTML.replace(
            /(<h3 class="target-role">[\s\S]*?<\/h3>)/,
            `$1\n    ${socialHTML}`
          );
        } else {
          populatedHTML = populatedHTML.replace(
            /(<h1>.*?<\/h1>)/,
            `$1\n    ${socialHTML}`
          );
        }
      }
    }

    // Remove any existing target-role first to avoid duplication
    populatedHTML = populatedHTML.replace(/<h3 class="target-role">[\s\S]*?<\/h3>\n?/, '');
    
    // Add target role if provided
    if (currentResume.target_role?.trim()) {
      populatedHTML = populatedHTML.replace(
        /(<h1>.*?<\/h1>)/,
        `$1\n    <h3 class="target-role">${currentResume.target_role}</h3>`
      );
    }

    // Replace with professional_summary (preferred) or career_objective
    const summaryText = currentResume.professional_summary?.trim() || currentResume.career_objective?.trim();
    if (summaryText) {
      // Change section title to "Professional Summary"
      populatedHTML = populatedHTML.replace(
        /<h2>(Career Objective|Professional Summary|Objective)<\/h2>/,
        '<h2>Professional Summary</h2>'
      );
      populatedHTML = populatedHTML.replace(
        /<div class="objective">[\s\S]*?<\/div>/,
        `<div class="objective"><p>${summaryText}</p></div>`
      );
    } else {
      // Hide entire section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>(Career Objective|Professional Summary|Objective)<\/h2>\s*<div class="objective">[\s\S]*?<\/div>/g,
        ''
      );
    }

    // Replace experience ONLY if exists
    if (currentResume.experience && currentResume.experience.length > 0) {
      const experienceHTML = currentResume.experience.map((exp) => `
        <div class="experience-item">
          <h3 class="job-title">${exp.job_title}</h3>
          <p class="company">${exp.company_name}</p>
          <p class="date">${exp.start_date || ''} ${exp.start_date && exp.end_date ? '-' : ''} ${exp.end_date || ''}</p>
          ${exp.description ? `<div class="description"><p>${exp.description.replace(/\n/g, '<br>')}</p></div>` : ''}
        </div>
      `).join('');
      
      populatedHTML = populatedHTML.replace(
        /(<h2>Experience<\/h2>|<h2>Professional Experience<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${experienceHTML}\n`
      );
    } else {
      // Hide experience section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>(Experience|Professional Experience|Work Experience)<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    // Replace education ONLY if exists
    if (currentResume.education && currentResume.education.length > 0) {
      const educationHTML = currentResume.education.map((edu) => `
        <div class="education-item">
          <h3 class="degree">${edu.degree}</h3>
          <p class="institute">${edu.institute_name}</p>
          <p class="date">${edu.start_year || ''} ${edu.start_year && edu.end_year ? '-' : ''} ${edu.end_year || ''} ${edu.grade ? `| ${edu.grade}` : ''}</p>
        </div>
      `).join('');
      
      populatedHTML = populatedHTML.replace(
        /(<h2>Education<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${educationHTML}\n`
      );
    } else {
      // Hide education section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>Education<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    // Replace skills with grid bullets ONLY if exists
    // Replace skills ONLY if exists
    if (currentResume.skills && currentResume.skills.length > 0) {
      const skillsHTML = currentResume.skills.map((s) => 
        `<div class="skill-item">${s.skill_name}</div>`
      ).join('');
      
      const skillsSection = `
    <h2>Technical Skills</h2>
    <div class="skills-list">
        <div class="skills-grid">
            ${skillsHTML}
        </div>
    </div>
`;
      
      populatedHTML = populatedHTML.replace(
        /<h2>(Skills|Technical Skills)<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        skillsSection.trim()
      );
    } else {
      // Hide skills section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>(Skills|Technical Skills)<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Replace languages with bullets ONLY if exists
    if (currentResume.languages && currentResume.languages.length > 0) {
      const languagesHTML = currentResume.languages.map((l) => 
        `<div class="language-item">${l.language_name}</div>`
      ).join('');
      
      const languagesSection = `
    <h2>Languages</h2>
    <div class="languages-list">
        <div class="languages-grid">
            ${languagesHTML}
        </div>
    </div>
`;
      
      populatedHTML = populatedHTML.replace(
        /<h2>Languages<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        languagesSection.trim()
      );
    } else {
      // Hide languages section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>Languages<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Replace projects ONLY if exists
    if (currentResume.projects && currentResume.projects.length > 0) {
      const projectsHTML = currentResume.projects.map((project) => `
        <div class="project-item">
          <h3 class="project-title">${project.title}</h3>
          ${project.start_date || project.end_date ? `<p class="date">${project.start_date || ''} ${project.start_date && project.end_date ? '-' : ''} ${project.end_date || ''}</p>` : ''}
          ${project.description ? `<div class="description"><p>${project.description.replace(/\n/g, '<br>')}</p></div>` : ''}
          ${project.technologies ? `<p class="project-tech">Technologies: ${project.technologies}</p>` : ''}
          ${project.project_url ? `<a href="${project.project_url}" class="project-link" target="_blank">View Project →</a>` : ''}
        </div>
      `).join('');
      
      const projectsSection = `
    <h2>Projects</h2>
    ${projectsHTML}
`;
      
      populatedHTML = populatedHTML.replace(
        /<h2>Projects<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        projectsSection.trim()
      );
    } else {
      // Hide projects section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>Projects<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Replace certifications ONLY if exists
    if (currentResume.certifications && currentResume.certifications.length > 0) {
      const certificationsHTML = currentResume.certifications.map((cert) => `
        <div class="cert-item">
          <p><strong>${cert.title}</strong>${cert.year ? ` - ${cert.year}` : ''}</p>
        </div>
      `).join('');
      
      populatedHTML = populatedHTML.replace(
        /(<h2>Certifications<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${certificationsHTML}\n`
      );
    } else {
      // Hide certifications section if empty
      populatedHTML = populatedHTML.replace(
        /<h2>Certifications<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    return populatedHTML;
  }, [templateHTML, currentResume]);

  // Download resume as PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!currentResume) return;

    const populatedHTML = getPopulatedHTML();
    if (!populatedHTML) return;

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = populatedHTML;
    document.body.appendChild(tempDiv);

    // Get user name for filename
    const userName = currentResume.personal_info?.full_name || 'Resume';
    const filename = `${userName} - Resume.pdf`;

    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().from(tempDiv).set(opt).save().then(() => {
      // Clean up
      document.body.removeChild(tempDiv);
    });
  }, [currentResume, getPopulatedHTML]);

  if (authLoading || resumeLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground">Loading resume...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || !token || !currentResume) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pb-8">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/resume-builder')}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{currentResume.title}</h1>
                {isSaving && (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                Last updated: {new Date(currentResume.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden bg-surface border border-accent text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-primary text-background font-semibold px-4 md:px-6 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:inline md:hidden">PDF</span>
              </button>
            </div>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper currentStep={currentStep} onStepClick={setCurrentStep} />

          {/* Main Content */}
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-surface border border-accent rounded-lg p-6">
                {currentStep === 1 && (
                  <PersonalInfoForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    updatePersonalData={updatePersonalData}
                  />
                )}

                {currentStep === 2 && (
                  <SummaryAndRoleForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    updateResumeBasic={updateResumeBasic}
                  />
                )}

                {currentStep === 3 && (
                  <ExperienceForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    addExperience={addExperienceEntry}
                    updateExperience={updateExperienceEntry}
                    deleteExperience={deleteExperienceEntry}
                  />
                )}

                {currentStep === 4 && (
                  <EducationForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    addEducation={addEducationEntry}
                    updateEducation={updateEducationEntry}
                    deleteEducation={deleteEducationEntry}
                  />
                )}

                {currentStep === 5 && (
                  <SkillsAndMoreForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    addSkill={addSkillEntry}
                    deleteSkill={deleteSkillEntry}
                    addLanguage={addLanguageEntry}
                    deleteLanguage={deleteLanguageEntry}
                    addCertification={addCertificationEntry}
                    updateCertification={updateCertificationEntry}
                    deleteCertification={deleteCertificationEntry}
                  />
                )}

                {currentStep === 6 && (
                  <ProjectsForm
                    resumeId={resumeId}
                    currentResume={currentResume}
                    token={token}
                    addProject={addProjectEntry}
                    updateProject={updateProjectEntry}
                    deleteProject={deleteProjectEntry}
                  />
                )}

                {currentStep === 7 && (
                  <ReviewAndExportForm
                    currentResume={currentResume}
                    onDownloadPDF={handleDownloadPDF}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-accent">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-2 rounded-lg bg-surface border border-accent text-foreground font-medium hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
                    disabled={currentStep === 7}
                    className="px-6 py-2 rounded-lg bg-primary text-background font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-surface border border-accent rounded-lg overflow-hidden sticky top-6">
                <div className="border-b border-accent p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-background border border-accent rounded-lg px-2 py-1">
                        <button
                          onClick={() => setPreviewZoom(Math.max(0.4, previewZoom - 0.1))}
                          className="text-text-secondary hover:text-foreground transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                          </svg>
                        </button>
                        <span className="text-xs font-medium text-foreground min-w-[2.5rem] text-center">
                          {Math.round(previewZoom * 100)}%
                        </span>
                        <button
                          onClick={() => setPreviewZoom(Math.min(1.2, previewZoom + 0.1))}
                          className="text-text-secondary hover:text-foreground transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 overflow-auto max-h-[calc(100vh-200px)] flex justify-center">
                  <div
                    className="transition-transform duration-200"
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: 'top center',
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-2xl border-4 border-white" style={{
                      width: '850px',
                      maxWidth: '100%'
                    }}>
                      {templateHTML ? (
                        <iframe
                          srcDoc={getPopulatedHTML()}
                          className="w-full border-0 rounded"
                          style={{
                            height: '1100px',
                            display: 'block'
                          }}
                          title="Resume Preview"
                          sandbox="allow-same-origin allow-scripts"
                        />
                      ) : (
                        <div className="h-[1100px] flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Personal Info Form Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PersonalInfoForm({ resumeId, currentResume, token, updatePersonalData }: any) {
  const [fullName, setFullName] = useState(currentResume.personal_info?.full_name || '');
  const [email, setEmail] = useState(currentResume.personal_info?.email || '');
  const [phone, setPhone] = useState(currentResume.personal_info?.phone || '');
  const [city, setCity] = useState(currentResume.personal_info?.city || '');
  const [address, setAddress] = useState(currentResume.personal_info?.address || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentResume.personal_info?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentResume.personal_info?.portfolio_url || '');
  const [githubUrl, setGithubUrl] = useState(currentResume.personal_info?.github_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(currentResume.personal_info?.website_url || '');

  const handleSave = async () => {
    try {
      // Update personal info with all fields including links
      await updatePersonalData(resumeId, {
        full_name: fullName,
        email,
        phone,
        city,
        address,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        website_url: websiteUrl,
      }, token);
    } catch (error) {
      console.error('Error saving personal info:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-sm text-text-secondary">Tell us about yourself</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          placeholder="John Doe"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email <span className="text-error">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="john.doe@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="New York, NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="123 Main Street"
          />
        </div>
      </div>

      {/* Professional Links Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Professional Links (Optional)
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Add your online profiles to boost ATS ranking (especially for tech & creative roles)
        </p>

        <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Portfolio Website
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://johndoe.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://github.com/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Personal Website
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://myblog.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary and Role Form Component (Step 2)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SummaryAndRoleForm({ resumeId, currentResume, token, updateResumeBasic }: any) {
  const [targetRole, setTargetRole] = useState(currentResume.target_role || '');
  const [professionalSummary, setProfessionalSummary] = useState(currentResume.professional_summary || '');

  const handleSave = async () => {
    try {
      await updateResumeBasic(resumeId, {
        target_role: targetRole,
        professional_summary: professionalSummary,
      }, token);
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Professional Summary & Target Role</h2>
        <p className="text-sm text-text-secondary">Modern, ATS-friendly approach to showcasing your career goals</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Target Role / Job Title
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          placeholder="e.g., Full Stack Developer | Software Engineer"
        />
        <p className="mt-1 text-xs text-text-secondary">
          💡 Tip: This appears below your name and boosts keyword relevance. Use job titles from the posting.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Professional Summary <span className="text-primary">(Recommended)</span>
        </label>
        <textarea
          value={professionalSummary}
          onChange={(e) => setProfessionalSummary(e.target.value)}
          onBlur={handleSave}
          rows={5}
          className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Dynamic and results-oriented software engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable web applications using React, Node.js, and cloud technologies..."
        />
        <p className="mt-1 text-xs text-text-secondary">
          💡 Tip: Write 3-4 sentences highlighting your experience, skills, and what you bring to the role. Use keywords from the job description.
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why Professional Summary?
        </h4>
        <ul className="text-sm text-foreground space-y-1 ml-7">
          <li>• More modern than &quot;Career Objective&quot;</li>
          <li>• ATS systems scan for keywords in this section</li>
          <li>• Shows results and experience, not just goals</li>
          <li>• Immediately tells recruiters if you&apos;re a good fit</li>
        </ul>
      </div>
    </div>
  );
}

// Experience Form Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExperienceForm({ resumeId, currentResume, token, addExperience, updateExperience, deleteExperience }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      job_title: '',
      company_name: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.job_title || !formData.company_name) {
      alert('Job title and company name are required');
      return;
    }

    try {
      await addExperience(resumeId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error adding experience:', error);
      alert('Failed to add experience');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setFormData({
      job_title: exp.job_title || '',
      company_name: exp.company_name || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      description: exp.description || ''
    });
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await updateExperience(resumeId, editingId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience');
    }
  };

  const handleDelete = async (expId: number) => {
    if (!confirm('Delete this experience entry?')) return;

    try {
      await deleteExperience(resumeId, expId, token);
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Work Experience</h2>
          <p className="text-sm text-text-secondary">Add your professional experience</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-background font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Experience
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-background border border-accent rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingId ? 'Edit Experience' : 'Add Experience'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="Senior Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <input
                type="text"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="January 2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="text"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="Present"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="• Led team of 10 developers&#10;• Increased efficiency by 30%&#10;• Implemented new features"
            />
            <p className="mt-1 text-xs text-text-secondary">Tip: Use bullet points for better readability</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
            >
              {editingId ? 'Update' : 'Add'} Experience
            </button>
            <button
              onClick={resetForm}
              className="bg-surface border border-accent text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Experience Entries List */}
      <div className="space-y-4">
        {currentResume.experience && currentResume.experience.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentResume.experience.map((exp: any) => (
            <div key={exp.id} className="bg-background border border-accent rounded-lg p-4 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-foreground">{exp.job_title}</h4>
                  <p className="text-sm text-text-secondary">{exp.company_name}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {exp.start_date} - {exp.end_date}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-foreground mt-3 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-primary hover:text-primary-dark transition-colors p-2"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-error hover:text-error/80 transition-colors p-2"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-background border border-accent rounded-lg">
            <svg className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-text-secondary">No experience added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-primary hover:text-primary-dark font-medium"
            >
              + Add your first experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Education Form Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EducationForm({ resumeId, currentResume, token, addEducation, updateEducation, deleteEducation }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    institute_name: '',
    degree: '',
    start_year: '',
    end_year: '',
    grade: ''
  });

  const resetForm = () => {
    setFormData({
      institute_name: '',
      degree: '',
      start_year: '',
      end_year: '',
      grade: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.institute_name || !formData.degree) {
      alert('Institute name and degree are required');
      return;
    }

    try {
      await addEducation(resumeId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error adding education:', error);
      alert('Failed to add education');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (edu: any) => {
    setEditingId(edu.id);
    setFormData({
      institute_name: edu.institute_name || '',
      degree: edu.degree || '',
      start_year: edu.start_year || '',
      end_year: edu.end_year || '',
      grade: edu.grade || ''
    });
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await updateEducation(resumeId, editingId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error updating education:', error);
      alert('Failed to update education');
    }
  };

  const handleDelete = async (eduId: number) => {
    if (!confirm('Delete this education entry?')) return;

    try {
      await deleteEducation(resumeId, eduId, token);
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Education</h2>
          <p className="text-sm text-text-secondary">Add your educational background</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-background font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Education
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-background border border-accent rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingId ? 'Edit Education' : 'Add Education'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Degree/Qualification <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({...formData, degree: e.target.value})}
              className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="Bachelor of Science in Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Institution Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.institute_name}
              onChange={(e) => setFormData({...formData, institute_name: e.target.value})}
              className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="University of California"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Year</label>
              <input
                type="text"
                value={formData.start_year}
                onChange={(e) => setFormData({...formData, start_year: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="2018"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Year</label>
              <input
                type="text"
                value={formData.end_year}
                onChange={(e) => setFormData({...formData, end_year: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="2022"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">GPA/Grade</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="3.8/4.0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
            >
              {editingId ? 'Update' : 'Add'} Education
            </button>
            <button
              onClick={resetForm}
              className="bg-surface border border-accent text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Education Entries List */}
      <div className="space-y-4">
        {currentResume.education && currentResume.education.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentResume.education.map((edu: any) => (
            <div key={edu.id} className="bg-background border border-accent rounded-lg p-4 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-text-secondary">{edu.institute_name}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {edu.start_year} - {edu.end_year} {edu.grade && `| ${edu.grade}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="text-primary hover:text-primary-dark transition-colors p-2"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="text-error hover:text-error/80 transition-colors p-2"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-background border border-accent rounded-lg">
            <svg className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <p className="text-text-secondary">No education added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-primary hover:text-primary-dark font-medium"
            >
              + Add your first education
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Skills and More Form Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillsAndMoreForm({ resumeId, currentResume, token, addSkill, deleteSkill, addLanguage, deleteLanguage, addCertification, updateCertification, deleteCertification }: any) {
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [certForm, setCertForm] = useState({ title: '', year: '' });
  const [editingCertId, setEditingCertId] = useState<number | null>(null);

  // Skills handlers
  const handleAddSkill = async () => {
    if (!skillInput.trim()) return;

    try {
      await addSkill(resumeId, skillInput.trim(), token);
      setSkillInput('');
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await deleteSkill(resumeId, skillId, token);
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    }
  };

  // Language handlers
  const handleAddLanguage = async () => {
    if (!languageInput.trim()) return;

    try {
      await addLanguage(resumeId, languageInput.trim(), token);
      setLanguageInput('');
    } catch (error) {
      console.error('Error adding language:', error);
      alert('Failed to add language');
    }
  };

  const handleDeleteLanguage = async (languageId: number) => {
    try {
      await deleteLanguage(resumeId, languageId, token);
    } catch (error) {
      console.error('Error deleting language:', error);
      alert('Failed to delete language');
    }
  };

  // Certification handlers
  const handleAddCertification = async () => {
    if (!certForm.title.trim()) {
      alert('Certification title is required');
      return;
    }

    try {
      if (editingCertId) {
        await updateCertification(resumeId, editingCertId, certForm, token);
        setEditingCertId(null);
      } else {
        await addCertification(resumeId, certForm, token);
      }
      setCertForm({ title: '', year: '' });
    } catch (error) {
      console.error('Error with certification:', error);
      alert('Failed to save certification');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditCertification = (cert: any) => {
    setEditingCertId(cert.id);
    setCertForm({ title: cert.title || '', year: cert.year || '' });
  };

  const handleDeleteCertification = async (certId: number) => {
    if (!confirm('Delete this certification?')) return;

    try {
      await deleteCertification(resumeId, certId, token);
    } catch (error) {
      console.error('Error deleting certification:', error);
      alert('Failed to delete certification');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Skills, Languages & Certifications</h2>
        <p className="text-sm text-text-secondary">Showcase your additional qualifications</p>
      </div>

      {/* Skills Section */}
      <div className="bg-background border border-accent rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Skills</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            className="flex-1 bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          />
          <button
            onClick={handleAddSkill}
            className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all whitespace-nowrap"
          >
            Add Skill
          </button>
        </div>

        {currentResume.skills && currentResume.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {currentResume.skills.map((skill: any) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {skill.skill_name}
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="hover:text-primary-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary italic">No skills added yet</p>
        )}
      </div>

      {/* Languages Section */}
      <div className="bg-background border border-accent rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Languages</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
            className="flex-1 bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
            placeholder="Enter a language (e.g., English (Native), Spanish (Fluent))"
          />
          <button
            onClick={handleAddLanguage}
            className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all whitespace-nowrap"
          >
            Add Language
          </button>
        </div>

        {currentResume.languages && currentResume.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {currentResume.languages.map((lang: any) => (
              <span
                key={lang.id}
                className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {lang.language_name}
                <button
                  onClick={() => handleDeleteLanguage(lang.id)}
                  className="hover:text-success/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary italic">No languages added yet</p>
        )}
      </div>

      {/* Certifications Section */}
      <div className="bg-background border border-accent rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Certifications</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={certForm.title}
              onChange={(e) => setCertForm({...certForm, title: e.target.value})}
              className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="Certification title (e.g., AWS Certified Solutions Architect)"
            />
          </div>
          <div>
            <input
              type="text"
              value={certForm.year}
              onChange={(e) => setCertForm({...certForm, year: e.target.value})}
              className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="Year (e.g., 2023)"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddCertification}
            className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
          >
            {editingCertId ? 'Update' : 'Add'} Certification
          </button>
          {editingCertId && (
            <button
              onClick={() => {
                setEditingCertId(null);
                setCertForm({ title: '', year: '' });
              }}
              className="bg-surface border border-accent text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        {currentResume.certifications && currentResume.certifications.length > 0 ? (
          <div className="space-y-3 mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {currentResume.certifications.map((cert: any) => (
              <div
                key={cert.id}
                className="bg-surface border border-accent rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-foreground">{cert.title}</h4>
                  {cert.year && <p className="text-sm text-text-secondary">{cert.year}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCertification(cert)}
                    className="text-primary hover:text-primary-dark transition-colors p-2"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="text-error hover:text-error/80 transition-colors p-2"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary italic">No certifications added yet</p>
        )}
      </div>
    </div>
  );
}

// Projects Form Component (Step 6)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectsForm({ resumeId, currentResume, token, addProject, updateProject, deleteProject }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    start_date: '',
    end_date: '',
    project_url: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: '',
      start_date: '',
      end_date: '',
      project_url: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    try {
      await addProject(resumeId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateProject(resumeId, editingId, formData, token);
      resetForm();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      technologies: project.technologies || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      project_url: project.project_url || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(resumeId, projectId, token);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const projects = currentResume?.projects || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Projects</h2>
        <p className="text-sm text-text-secondary">Showcase your portfolio and key projects (especially important for tech, students, & freelancers)</p>
      </div>

      {/* Add Project Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-primary/10 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/20 text-primary font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Project
        </button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-surface border border-accent rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g., Job Portal Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Developed a full-stack job portal using React and Node.js integrated with ATS parser..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Technologies Used
            </label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="React, Node.js, PostgreSQL, TypeScript"
            />
            <p className="mt-1 text-xs text-text-secondary">Separate with commas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="text"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="Jan 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="text"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="Present"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project URL (Optional)
            </label>
            <input
              type="url"
              value={formData.project_url}
              onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
              className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://github.com/user/project or https://liveproject.com"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
            >
              {editingId ? 'Update Project' : 'Add Project'}
            </button>
            <button
              onClick={resetForm}
              className="bg-surface border border-accent text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {projects.map((project: any) => (
            <div key={project.id} className="bg-surface border border-accent rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{project.title}</h3>
                  {project.start_date && (
                    <p className="text-sm text-text-secondary mt-1">
                      {project.start_date} {project.end_date && `- ${project.end_date}`}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm text-foreground mt-2">{project.description}</p>
                  )}
                  {project.technologies && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.split(',').map((tech: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      View Project →
                    </a>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-primary hover:bg-primary/10 p-2 rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-error hover:bg-error/10 p-2 rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No projects added yet</p>
          <p className="text-sm mt-1">Click &quot;Add Project&quot; to showcase your work</p>
        </div>
      )}
    </div>
  );
}

// Review and Export Form Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReviewAndExportForm({ currentResume, onDownloadPDF }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review & Export</h2>
        <p className="text-sm text-text-secondary">Review your resume and export to PDF</p>
      </div>

      <div className="bg-background border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Resume Summary</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Title:</span>
            <span className="text-foreground font-medium">{currentResume.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Template:</span>
            <span className="text-foreground font-medium">{currentResume.template_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Name:</span>
            <span className="text-foreground font-medium">{currentResume.personal_info?.full_name || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Experience Entries:</span>
            <span className="text-foreground font-medium">{currentResume.experience?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Education Entries:</span>
            <span className="text-foreground font-medium">{currentResume.education?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Skills:</span>
            <span className="text-foreground font-medium">{currentResume.skills?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Languages:</span>
            <span className="text-foreground font-medium">{currentResume.languages?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Certifications:</span>
            <span className="text-foreground font-medium">{currentResume.certifications?.length || 0}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-accent space-y-3">
          <button
            onClick={onDownloadPDF}
            className="w-full bg-primary text-background font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download as PDF
          </button>
          <p className="text-xs text-text-secondary text-center">
            Filename: {currentResume.personal_info?.full_name || 'Resume'} - Resume.pdf
          </p>
        </div>
      </div>
    </div>
  );
}

