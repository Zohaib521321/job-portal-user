'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ResumePreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, token, isLoading: authLoading } = useAuth();
  const { currentResume, isLoading: resumeLoading, fetchResume } = useResume();
  const router = useRouter();
  
  const [templateHTML, setTemplateHTML] = useState('');
  const [previewZoom, setPreviewZoom] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resumeId = parseInt(id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token && resumeId) {
      fetchResume(resumeId, token).catch(error => {
        console.error('Failed to fetch resume:', error);
        alert('Failed to load resume');
        router.push('/resume-builder');
      });
    }
  }, [resumeId, user, token, fetchResume, router]);

  useEffect(() => {
    if (currentResume?.template_name) {
      fetch(`/templates/${currentResume.template_name}/index.html`)
        .then(response => response.text())
        .then(html => {
          // Populate template with resume data
          const populated = populateTemplate(html, currentResume);
          setTemplateHTML(populated);
        })
        .catch(error => console.error('Error loading template:', error));
    }
  }, [currentResume]);

  // Download resume as PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!currentResume || !templateHTML) return;

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = templateHTML;
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
  }, [currentResume, templateHTML]);

  // Populate template with all resume data - ONLY show sections with data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populateTemplate = (html: string, resume: any) => {
    let populated = html;

    // Personal Info ONLY if provided
    const personalInfo = resume.personal_info;
    if (personalInfo?.full_name) {
      populated = populated.replace(/<h1>.*?<\/h1>/, `<h1>${personalInfo.full_name}</h1>`);
    } else {
      populated = populated.replace(/<h1>.*?<\/h1>/, '');
    }
    
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
        populated = populated.replace(
          /<div class="contact-info">[\s\S]*?<\/div>/,
          `<div class="contact-info">${contactHTML}</div>`
        );
      } else {
        populated = populated.replace(/<div class="contact-info">[\s\S]*?<\/div>/, '');
      }
      
      // Remove any existing social links first to avoid duplication
      populated = populated.replace(/<div class="social-links">[\s\S]*?<\/div>\n?/, '');
      
      // Add social links if any exist
      const socialLinks = [];
      if (personalInfo.linkedin_url) socialLinks.push(`<a href="${personalInfo.linkedin_url}" target="_blank">LinkedIn</a>`);
      if (personalInfo.portfolio_url) socialLinks.push(`<a href="${personalInfo.portfolio_url}" target="_blank">Portfolio</a>`);
      if (personalInfo.github_url) socialLinks.push(`<a href="${personalInfo.github_url}" target="_blank">GitHub</a>`);
      if (personalInfo.website_url) socialLinks.push(`<a href="${personalInfo.website_url}" target="_blank">Website</a>`);
      
      if (socialLinks.length > 0) {
        const socialHTML = `<div class="social-links">${socialLinks.join(' ')}</div>`;
        if (populated.includes('class="contact-info"')) {
          populated = populated.replace(
            /(<div class="contact-info">[\s\S]*?<\/div>)/,
            `$1\n    ${socialHTML}`
          );
        } else if (populated.includes('class="target-role"')) {
          populated = populated.replace(
            /(<h3 class="target-role">[\s\S]*?<\/h3>)/,
            `$1\n    ${socialHTML}`
          );
        } else {
          populated = populated.replace(
            /(<h1>.*?<\/h1>)/,
            `$1\n    ${socialHTML}`
          );
        }
      }
    }

    // Remove any existing target-role first to avoid duplication
    populated = populated.replace(/<h3 class="target-role">[\s\S]*?<\/h3>\n?/, '');
    
    // Add target role if provided
    if (resume.target_role?.trim()) {
      populated = populated.replace(
        /(<h1>.*?<\/h1>)/,
        `$1\n    <h3 class="target-role">${resume.target_role}</h3>`
      );
    }

    // Replace with professional_summary (preferred) or career_objective
    const summaryText = resume.professional_summary?.trim() || resume.career_objective?.trim();
    if (summaryText) {
      // Change section title to "Professional Summary"
      populated = populated.replace(
        /<h2>(Career Objective|Professional Summary|Objective)<\/h2>/,
        '<h2>Professional Summary</h2>'
      );
      populated = populated.replace(
        /<div class="objective">[\s\S]*?<\/div>/,
        `<div class="objective"><p>${summaryText}</p></div>`
      );
    } else {
      // Hide section if empty
      populated = populated.replace(
        /<h2>(Career Objective|Professional Summary|Objective)<\/h2>\s*<div class="objective">[\s\S]*?<\/div>/g,
        ''
      );
    }

    // Experience ONLY if exists
    if (resume.experience && resume.experience.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const experienceHTML = resume.experience.map((exp: any) => `
        <div class="experience-item">
          <h3 class="job-title">${exp.job_title}</h3>
          <p class="company">${exp.company_name}</p>
          <p class="date">${exp.start_date || ''} ${exp.start_date && exp.end_date ? '-' : ''} ${exp.end_date || ''}</p>
          ${exp.description ? `<div class="description"><p>${exp.description.replace(/\n/g, '<br>')}</p></div>` : ''}
        </div>
      `).join('');
      
      populated = populated.replace(
        /(<h2>Experience<\/h2>|<h2>Professional Experience<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${experienceHTML}\n`
      );
    } else {
      populated = populated.replace(
        /<h2>(Experience|Professional Experience|Work Experience)<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    // Education ONLY if exists
    if (resume.education && resume.education.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const educationHTML = resume.education.map((edu: any) => `
        <div class="education-item">
          <h3 class="degree">${edu.degree}</h3>
          <p class="institute">${edu.institute_name}</p>
          <p class="date">${edu.start_year || ''} ${edu.start_year && edu.end_year ? '-' : ''} ${edu.end_year || ''} ${edu.grade ? `| ${edu.grade}` : ''}</p>
        </div>
      `).join('');
      
      populated = populated.replace(
        /(<h2>Education<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${educationHTML}\n`
      );
    } else {
      populated = populated.replace(
        /<h2>Education<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    // Replace skills ONLY if exists
    if (resume.skills && resume.skills.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skillsHTML = resume.skills.map((s: any) => 
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
      
      populated = populated.replace(
        /<h2>(Skills|Technical Skills)<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        skillsSection.trim()
      );
    } else {
      populated = populated.replace(
        /<h2>(Skills|Technical Skills)<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Replace languages with bullets ONLY if exists
    if (resume.languages && resume.languages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const languagesHTML = resume.languages.map((l: any) => 
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
      
      populated = populated.replace(
        /<h2>Languages<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        languagesSection.trim()
      );
    } else {
      populated = populated.replace(
        /<h2>Languages<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Replace projects ONLY if exists
    if (resume.projects && resume.projects.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectsHTML = resume.projects.map((project: any) => `
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
      
      populated = populated.replace(
        /<h2>Projects<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        projectsSection.trim()
      );
    } else {
      // Hide projects section if empty
      populated = populated.replace(
        /<h2>Projects<\/h2>[\s\S]*?(?=\n\s*<h2>|\n\s*<\/body>)/,
        ''
      );
    }

    // Certifications ONLY if exists
    if (resume.certifications && resume.certifications.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificationsHTML = resume.certifications.map((cert: any) => `
        <div class="cert-item">
          <p><strong>${cert.title}</strong>${cert.year ? ` - ${cert.year}` : ''}</p>
        </div>
      `).join('');
      
      populated = populated.replace(
        /(<h2>Certifications<\/h2>)([\s\S]*?)(?=<h2>|<\/body>)/,
        `$1\n${certificationsHTML}\n`
      );
    } else {
      populated = populated.replace(
        /<h2>Certifications<\/h2>[\s\S]*?(?=<h2>|<\/body>)/,
        ''
      );
    }

    return populated;
  };

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

  if (!user || !currentResume) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-background ${isFullscreen ? 'pt-0' : 'py-6'}`}>
        <div className={`${isFullscreen ? 'w-full' : 'container mx-auto px-4'}`}>
          {/* Header */}
          {!isFullscreen && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/resume-builder')}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{currentResume.title}</h1>
                  <p className="text-sm text-text-secondary">Preview Mode</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-surface border border-accent rounded-lg px-3 py-2">
                  <button
                    onClick={() => setPreviewZoom(Math.max(0.4, previewZoom - 0.1))}
                    className="text-text-secondary hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  <span className="text-sm text-foreground font-medium min-w-[3rem] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
                    className="text-text-secondary hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="bg-surface border border-accent text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => router.push(`/resume-builder/edit/${resumeId}`)}
                  className="bg-primary text-background font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit Resume</span>
                  <span className="sm:inline md:hidden">Edit</span>
                </button>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  className="bg-success text-white font-semibold px-4 py-2 rounded-lg hover:bg-success/90 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:inline md:hidden">PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className={`${isFullscreen ? 'p-0' : 'bg-surface border border-accent rounded-lg overflow-hidden'}`}>
            <div className="p-4 md:p-8 bg-gradient-to-b from-accent/5 to-accent/10 flex items-start justify-center min-h-screen">
              {templateHTML ? (
                <div
                  className="transition-transform duration-200"
                  style={{
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl border-8 border-white" style={{
                    width: '850px',
                    maxWidth: '100%'
                  }}>
                    <iframe
                      srcDoc={templateHTML}
                      className="w-full border-0 rounded"
                      style={{
                        height: '1100px',
                        display: 'block'
                      }}
                      title="Resume Preview"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
                  <p className="text-lg text-text-secondary">Loading resume preview...</p>
                </div>
              )}
            </div>
          </div>

          {/* Fullscreen Floating Controls */}
          {isFullscreen && (
            <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2 bg-surface border border-accent rounded-lg px-3 py-2 shadow-lg">
                <button
                  onClick={() => setPreviewZoom(Math.max(0.4, previewZoom - 0.1))}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <span className="text-sm text-foreground font-medium min-w-[3rem] text-center">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
              </div>

              {/* Exit Fullscreen */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="bg-surface border border-accent text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-all shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit Fullscreen
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

