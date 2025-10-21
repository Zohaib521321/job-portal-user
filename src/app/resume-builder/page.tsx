'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Template configuration
const TEMPLATES = [
  { 
    id: "template01_classic", 
    name: "Classic Professional", 
    description: "Clean, traditional layout. Focus on Experience and Education.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FClassic%20Professional-Preview.png?alt=media&token=ab500666-7af0-42c3-8b79-8109b73714b7"
  },
  { 
    id: "template02_modern", 
    name: "Modern Clean", 
    description: "Slightly modern spacing, subtle bold headings.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FModern%20Clean-Preview.png?alt=media&token=69535999-d51a-4f9b-b2d0-8130d5e3212b"
  },
  { 
    id: "template03_creative", 
    name: "Creative Portfolio", 
    description: "Minimal graphics, highlight projects section.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FCreative%20Portfolio-Preview.png?alt=media&token=a0429b7f-47c8-4f57-a3c4-8f5e0da02723"
  },
  { 
    id: "template04_minimal", 
    name: "Minimal Resume", 
    description: "Very simple, whitespace-heavy, one main column.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FMinimal%20Resume-Preview.png?alt=media&token=cab35b31-9359-4470-b3d6-6c759bc0dfb7"
  },
  { 
    id: "template05_professional", 
    name: "Professional Modern", 
    description: "Modern fonts, subtle lines for sections.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FProfessional%20Modern-Preview.png?alt=media&token=a8dbf89b-9125-4efe-9d1b-5bd3c6e63d6c"
  },
  { 
    id: "template06_tech", 
    name: "Tech Resume", 
    description: "Focus on skills, certifications, and projects.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FTech%20Resume-Preview.png?alt=media&token=a83cb159-bd85-4f77-b63c-62824d79d24f"
  },
  { 
    id: "template07_portfolio", 
    name: "Portfolio Style", 
    description: "Highlights projects and achievements first.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FPortfolio%20Style-Preview.png?alt=media&token=8cdf64f6-0f79-4b55-b1b0-c13165b0002e"
  },
  { 
    id: "template08_experienced", 
    name: "Experienced Professional", 
    description: "For mid-level to senior candidates.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FExperienced%20Professional-Preview.png?alt=media&token=95c8aaef-eeea-4226-8914-324888594d56"
  },
  { 
    id: "template09_startup", 
    name: "Startup Friendly", 
    description: "Modern, slightly creative, concise format.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FStartup%20Friendly-Preview.png?alt=media&token=b22984fe-fdd3-49ac-8583-d42c3319056b"
  },
  { 
    id: "template10_student", 
    name: "Student Resume", 
    description: "Emphasizes Education, Internships, and Skills.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FStudent%20Resume-Preview.png?alt=media&token=501d5d96-5380-42d1-8263-6952f2031233"
  },
  { 
    id: "template11_freelancer", 
    name: "Freelancer Style", 
    description: "Highlights Projects and Skills; minimal headings.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FFreelancer%20Style-Preview.png?alt=media&token=da50be44-035b-41cc-a82f-9851a59317f9"
  },
  { 
    id: "template12_manager", 
    name: "Manager Resume", 
    description: "Focus on leadership, achievements, and Experience.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FManager%20Resume-Preview.png?alt=media&token=d73105d8-5160-4556-9adc-7f8e70f4d15e"
  },
  { 
    id: "template13_design", 
    name: "Design Portfolio", 
    description: "Clean showcase of work with project descriptions.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FDesign%20Portfolio-Preview.png?alt=media&token=a5c61acb-1592-4415-8767-c8977ee06b38"
  },
  { 
    id: "template14_engineer", 
    name: "Engineer Style", 
    description: "Technical focus; experience and certifications up front.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FEngineer%20Style-Preview.png?alt=media&token=3221ce5f-54b5-4947-ac8f-a9c47d0feb07"
  },
  { 
    id: "template15_innovator", 
    name: "Innovator Resume", 
    description: "Highlights unique projects and achievements.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FInnovator%20Resume-Preview.png?alt=media&token=875b6987-5f7e-430f-9d2d-c252fc1b5c1e"
  },
  { 
    id: "template16_advanced", 
    name: "Portfolio Advanced", 
    description: "Combines skills, projects, experience in a clean layout.",
    previewImage: "https://firebasestorage.googleapis.com/v0/b/black-hole-tracking.firebasestorage.app/o/Preview%20Images%2FPortfolio%20Advanced-Preview.png?alt=media&token=9f363704-fef1-47e2-9fbf-f3d6d4e5a2ca"
  }
];


export default function ResumeBuilderPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { 
    resumes, 
    isLoading: resumesLoading, 
    isSaving,
    fetchUserResumes, 
    createNewResume, 
    deleteUserResume,
    setSelectedTemplate: setResumeTemplate
  } = useResume();
  const router = useRouter();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateHTML, setTemplateHTML] = useState<string>('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Responsive initial zoom - optimized for each screen size
  const getInitialZoom = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 0.4;  // Mobile
      if (window.innerWidth < 1024) return 0.65; // Tablet
      if (window.innerWidth < 1440) return 0.75; // Small desktop
      return 0.85; // Large desktop
    }
    return 0.75;
  };
  const [previewZoom, setPreviewZoom] = useState(getInitialZoom());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's resumes on mount
  useEffect(() => {
    if (user && token && !showTemplates) {
      fetchUserResumes(token).catch(error => {
        console.error('Failed to fetch resumes:', error);
      });
    }
  }, [user, token, showTemplates, fetchUserResumes]);

  // Lazy load template HTML when selected
  const loadTemplate = async (templateId: string) => {
    setLoadingTemplate(true);
    try {
      const response = await fetch(`/templates/${templateId}/index.html`);
      if (response.ok) {
        const html = await response.text();
        setTemplateHTML(html);
        setSelectedTemplate(templateId);
      } else {
        console.error('Failed to load template');
        setTemplateHTML('');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setTemplateHTML('');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Create resume with selected template
  const handleUseTemplate = async () => {
    if (!selectedTemplate || !user || !token) {
      if (!token) {
        alert('Please log in to create a resume');
        router.push('/auth/login');
      }
      return;
    }

    try {
      const templateName = TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'My Resume';
      
      const resume = await createNewResume(
        {
          title: templateName,
          template_name: selectedTemplate,
          career_objective: '',
        },
        token
      );

      if (resume) {
        setResumeTemplate(selectedTemplate);
        // Navigate to resume builder form page
        router.push(`/resume-builder/edit/${resume.id}`);
      }
    } catch (error: unknown) {
      console.error('Error creating resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resume. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle delete resume
  const handleDeleteResume = async (resumeId: number) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(resumeId);
    try {
      await deleteUserResume(resumeId, token);
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const isLoading = authLoading || resumesLoading;

  // If showing templates, render full-page template browser
  if (showTemplates) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Choose Your Template</h1>
                <p className="text-sm md:text-base text-text-secondary">Select an ATS-friendly template to get started</p>
              </div>
              <button 
                onClick={() => {
                  setShowTemplates(false);
                  setSelectedTemplate(null);
                  setTemplateHTML('');
                  setPreviewZoom(getInitialZoom());
                }}
                className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
              {/* Templates Sidebar */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="bg-surface border border-accent rounded-lg p-3 md:p-4 lg:sticky lg:top-6 max-h-[300px] lg:max-h-[calc(100vh-120px)] overflow-y-auto">
                  <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">All Templates ({TEMPLATES.length})</h2>
                  
                  {/* Mobile: Horizontal Scroll Grid */}
                  <div className="lg:hidden overflow-x-auto -mx-3 px-3">
                    <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                      {TEMPLATES.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => loadTemplate(template.id)}
                          className={`flex-shrink-0 w-48 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-background border border-accent hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            {template.previewImage ? (
                              <div className={`w-full aspect-[3/4] rounded border-2 overflow-hidden ${
                                selectedTemplate === template.id ? 'border-primary' : 'border-accent'
                              }`}>
                                <img 
                                  src={template.previewImage} 
                                  alt={template.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`w-8 h-10 rounded ${
                                selectedTemplate === template.id ? 'bg-primary/20' : 'bg-accent/50'
                              } flex items-center justify-center`}>
                                <svg className={`w-4 h-4 ${
                                  selectedTemplate === template.id ? 'text-primary' : 'text-text-secondary'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <h3 className={`font-semibold text-xs mb-1 ${
                                selectedTemplate === template.id ? 'text-primary' : 'text-foreground'
                              }`}>{template.name}</h3>
                              <p className="text-[10px] text-text-secondary line-clamp-2">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Vertical List */}
                  <div className="hidden lg:block space-y-3">
                    {TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => loadTemplate(template.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-background border border-accent hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {template.previewImage ? (
                            <div className={`flex-shrink-0 w-16 h-20 rounded border-2 overflow-hidden ${
                              selectedTemplate === template.id ? 'border-primary' : 'border-accent'
                            }`}>
                              <img 
                                src={template.previewImage} 
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`flex-shrink-0 w-10 h-12 rounded ${
                              selectedTemplate === template.id ? 'bg-primary/20' : 'bg-accent/50'
                            } flex items-center justify-center`}>
                              <svg className={`w-5 h-5 ${
                                selectedTemplate === template.id ? 'text-primary' : 'text-text-secondary'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm mb-1 ${
                              selectedTemplate === template.id ? 'text-primary' : 'text-foreground'
                            }`}>{template.name}</h3>
                            <p className="text-xs text-text-secondary line-clamp-2">{template.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="lg:col-span-8 xl:col-span-9">
                {!selectedTemplate && !loadingTemplate && (
                  <div className="bg-surface border border-accent rounded-lg p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px] md:min-h-[calc(100vh-200px)]">
                    <div className="max-w-md mx-auto">
                      <div className="bg-primary/10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 md:w-16 h-12 md:h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Select a Template to Preview</h3>
                      <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                        Browse through our collection of ATS-friendly templates and click on any template to see a detailed preview
                      </p>
                    </div>
                  </div>
                )}

                {loadingTemplate && (
                  <div className="bg-surface border border-accent rounded-lg p-12 md:p-16 text-center min-h-[400px] md:min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-b-4 border-primary mx-auto mb-6"></div>
                    <p className="text-base md:text-lg text-text-secondary font-medium">Loading template preview...</p>
                    <p className="text-xs md:text-sm text-text-secondary/70 mt-2">This will only take a moment</p>
                  </div>
                )}

                {selectedTemplate && templateHTML && !loadingTemplate && (
                  <div className="bg-surface border border-accent rounded-lg overflow-hidden">
                    {/* Preview Controls */}
                    <div className="border-b border-accent p-3 md:p-4 bg-background/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                            {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                          </h3>
                          <p className="text-xs md:text-sm text-text-secondary line-clamp-1">
                            {TEMPLATES.find(t => t.id === selectedTemplate)?.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          {/* Zoom Controls */}
                          <div className="flex items-center gap-1 md:gap-2 bg-background border border-accent rounded-lg px-2 md:px-3 py-1.5 md:py-2">
                            <button
                              onClick={() => setPreviewZoom(Math.max(0.3, previewZoom - 0.1))}
                              className="text-text-secondary hover:text-foreground transition-colors"
                              title="Zoom out"
                            >
                              <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                              </svg>
                            </button>
                            <span className="text-xs md:text-sm text-foreground font-medium min-w-[2.5rem] md:min-w-[3rem] text-center">
                              {Math.round(previewZoom * 100)}%
                            </span>
                            <button
                              onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
                              className="text-text-secondary hover:text-foreground transition-colors"
                              title="Zoom in"
                            >
                              <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </button>
                          </div>
                          {/* <button 
                            onClick={handleDownloadPreviewImage}
                            className="bg-success/10 border border-success/30 text-success font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-success/20 transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base whitespace-nowrap"
                          >
                            <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Download Preview</span>
                            <span className="sm:hidden">Image</span>
                          </button> */}
                          <button 
                            onClick={handleUseTemplate}
                            disabled={isSaving}
                            className="bg-primary text-background font-semibold px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-background"></div>
                                <span className="hidden sm:inline">Creating...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="hidden sm:inline">Use This Template</span>
                                <span className="sm:hidden">Use</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Template Preview with Zoom */}
                    <div className="p-4 md:p-8 bg-gradient-to-b from-accent/5 to-accent/10 overflow-auto max-h-[calc(100vh-280px)] flex items-start justify-center">
                      <div 
                        className="transition-transform duration-200 ease-out"
                        style={{ 
                          transform: `scale(${previewZoom})`,
                          transformOrigin: 'top center'
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
                            title="Resume Template Preview"
                            sandbox="allow-same-origin allow-scripts"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main dashboard view
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Resume Builder
            </h1>
            <p className="text-text-secondary text-lg">
              Create professional resumes with our easy-to-use builder
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Welcome back, {user.full_name}!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface border border-accent rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Create New Resume</h3>
              <p className="text-text-secondary mb-4">Start building your professional resume from scratch</p>
              <button 
                onClick={() => setShowTemplates(true)}
                className="w-full bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Resume
              </button>
            </div>

            <div className="bg-surface border border-accent rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">My Resumes</h3>
              <p className="text-text-secondary mb-4">
                {resumes.length > 0 ? `You have ${resumes.length} resume${resumes.length === 1 ? '' : 's'}` : 'View and edit your existing resumes'}
              </p>
              <div className="text-2xl font-bold text-primary">{resumes.length}</div>
            </div>

            <div className="bg-surface border border-accent rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Templates</h3>
              <p className="text-text-secondary mb-4">Choose from professional resume templates</p>
              <button 
                onClick={() => setShowTemplates(true)}
                className="w-full bg-surface border border-accent text-foreground py-2 px-4 rounded-md hover:bg-accent transition-colors"
              >
                Browse Templates
              </button>
            </div>
          </div>

          {/* Recent Resumes */}
          <div className="bg-surface border border-accent rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">My Resumes</h2>
              {resumes.length > 0 && (
                <button
                  onClick={() => setShowTemplates(true)}
                  className="bg-primary text-background font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Resume
                </button>
              )}
            </div>

            {isLoading && resumes.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading your resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-text-secondary mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-lg mb-4">No resumes yet</p>
                <p className="text-text-secondary mb-6">Create your first resume to get started</p>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="bg-primary text-background font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Resume
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-background border border-accent rounded-lg overflow-hidden hover:border-primary/50 transition-all group"
                  >
                    {/* Template Preview Thumbnail */}
                    <div className="aspect-[3/4] bg-accent/20 border-b border-accent group-hover:bg-accent/30 transition-colors overflow-hidden">
                      {TEMPLATES.find(t => t.id === resume.template_name)?.previewImage ? (
                        <img 
                          src={TEMPLATES.find(t => t.id === resume.template_name)?.previewImage} 
                          alt={TEMPLATES.find(t => t.id === resume.template_name)?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg className="w-12 h-12 text-text-secondary/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-xs text-text-secondary">
                              {TEMPLATES.find(t => t.id === resume.template_name)?.name || resume.template_name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resume Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2 truncate">{resume.title}</h3>
                      <p className="text-xs text-text-secondary mb-4">
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => router.push(`/resume-builder/edit/${resume.id}`)}
                          className="w-full bg-primary text-background font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/resume-builder/cover-letter/${resume.id}`)}
                          className="w-full bg-success/10 border border-success/30 text-success font-medium px-4 py-2 rounded-lg hover:bg-success/20 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Cover Letters
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => router.push(`/resume-builder/preview/${resume.id}`)}
                            className="bg-surface border border-accent text-foreground font-medium px-3 py-2 rounded-lg hover:bg-accent transition-all flex items-center justify-center gap-1 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            disabled={deletingId === resume.id}
                            className="bg-error/10 border border-error/30 text-error font-medium px-3 py-2 rounded-lg hover:bg-error/20 transition-all flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === resume.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Why Choose Our Resume Builder?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fast & Easy</h3>
                <p className="text-text-secondary">Create professional resumes in minutes with our intuitive builder</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Professional Templates</h3>
                <p className="text-text-secondary">Choose from ATS-friendly templates designed by professionals</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Secure & Private</h3>
                <p className="text-text-secondary">Your data is encrypted and secure. We never share your information</p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link href="/" className="text-primary hover:text-primary-dark">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
