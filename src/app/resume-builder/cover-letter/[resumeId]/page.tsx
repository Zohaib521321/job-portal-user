'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import type { CoverLetter } from '@/lib/resumeApi';
import Navbar from '@/components/Navbar';

export default function CoverLetterPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = parseInt(params.resumeId as string);
  const { user, token } = useAuth();
  const { 
    coverLetters, 
    fetchCoverLetters, 
    createNewCoverLetter, 
    updateCoverLetterEntry, 
    deleteCoverLetterEntry,
    isLoading,
    isSaving,
    currentResume,
    fetchResume
  } = useResume();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    tone: 'formal',
    letter_text: '',
  });

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchResume(resumeId, token);
    fetchCoverLetters(resumeId, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, resumeId]);

  const handleCreate = async () => {
    if (!token) return;

    try {
      await createNewCoverLetter({
        resume_id: resumeId,
        ...formData,
      }, token);
      
      // Reset form
      setFormData({
        job_title: '',
        company_name: '',
        tone: 'formal',
        letter_text: '',
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create cover letter:', error);
      alert('Failed to create cover letter');
    }
  };

  const handleUpdate = async (coverLetterId: number) => {
    if (!token) return;

    try {
      await updateCoverLetterEntry(coverLetterId, formData, token);
      setEditingId(null);
      setFormData({
        job_title: '',
        company_name: '',
        tone: 'formal',
        letter_text: '',
      });
    } catch (error) {
      console.error('Failed to update cover letter:', error);
      alert('Failed to update cover letter');
    }
  };

  const handleDelete = async (coverLetterId: number) => {
    if (!token || !confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await deleteCoverLetterEntry(coverLetterId, token);
    } catch (error) {
      console.error('Failed to delete cover letter:', error);
      alert('Failed to delete cover letter');
    }
  };

  const handleEdit = (coverLetter: CoverLetter) => {
    setEditingId(coverLetter.id);
    setFormData({
      job_title: coverLetter.job_title || '',
      company_name: coverLetter.company_name || '',
      tone: coverLetter.tone || 'formal',
      letter_text: coverLetter.letter_text || '',
    });
  };

  const handleDownloadPDF = async (coverLetter: CoverLetter) => {
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      // Load template
      const templateResponse = await fetch('/templates/cover-letter-template.html');
      const template = await templateResponse.text();

      // Get personal info from resume
      const personalInfo = currentResume?.personal_info;

      // Replace placeholders
      const html = template
        .replace('{{APPLICANT_NAME}}', personalInfo?.full_name || 'Your Name')
        .replace(/{{APPLICANT_NAME}}/g, personalInfo?.full_name || 'Your Name')
        .replace('{{APPLICANT_EMAIL}}', personalInfo?.email || 'your.email@example.com')
        .replace('{{APPLICANT_PHONE}}', personalInfo?.phone || 'Your Phone')
        .replace('{{APPLICANT_ADDRESS}}', personalInfo?.address || 'Your Address')
        .replace('{{DATE}}', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
        .replace('{{COMPANY_NAME}}', coverLetter.company_name || 'Company Name')
        .replace('{{LETTER_TEXT}}', (coverLetter.letter_text || '').split('\n').map(p => `<div class="paragraph">${p}</div>`).join(''));

      // Create temporary element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv);

      // Get user name for filename
      const userName = personalInfo?.full_name || 'CoverLetter';
      const companyName = coverLetter.company_name || 'Application';
      const filename = `${userName} - Cover Letter - ${companyName}.pdf`;

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
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleGenerateEmail = (coverLetter: CoverLetter) => {
    const personalInfo = currentResume?.personal_info;
    const fullName = personalInfo?.full_name || '[Your Full Name]';
    const email = personalInfo?.email || '[Your Email]';
    const phone = personalInfo?.phone || '[Your Phone Number]';
    const jobTitle = coverLetter.job_title || '[Job Title]';
    const companyName = coverLetter.company_name || '[Company Name]';

    // Extract first paragraph from cover letter as preview
    const letterPreview = coverLetter.letter_text?.split('\n')[0]?.substring(0, 150) || '';

    const emailTemplate = `Subject: Application for ${jobTitle} – ${fullName}

Dear Hiring Manager,

I'm writing to apply for the ${jobTitle} position at ${companyName}. ${letterPreview ? letterPreview + '...' : 'I am excited about this opportunity to contribute to your team.'}

I have attached my resume and cover letter for your review. With my background and skills, I'm confident in my ability to contribute effectively to ${companyName}.

Thank you for considering my application. I'd love the chance to discuss how I can help ${companyName} achieve its goals.

Best regards,
${fullName}
${phone}
${email}
${personalInfo?.city ? personalInfo.city : ''}`;

    setGeneratedEmail(emailTemplate);
    setShowEmailModal(true);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email copied to clipboard!');
  };

  const openEmailClient = () => {
    // Extract subject and body from generated email
    const emailLines = generatedEmail.split('\n');
    const subject = emailLines[0].replace('Subject: ', '');
    const body = emailLines.slice(2).join('\n'); // Skip "Subject:" line and empty line
    
    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      job_title: '',
      company_name: '',
      tone: 'formal',
      letter_text: '',
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-foreground text-lg">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cover Letters</h1>
              {currentResume && (
                <p className="text-text-secondary mt-2">For resume: {currentResume.title}</p>
              )}
            </div>
            
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-primary text-background font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200"
              >
                + Create Cover Letter
              </button>
            )}
          </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId !== null) && (
          <div className="bg-surface rounded-lg p-6 shadow-lg border border-accent mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {isCreating ? 'Create New Cover Letter' : 'Edit Cover Letter'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Tech Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="formal">Formal</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Letter Content
                </label>
                <textarea
                  value={formData.letter_text}
                  onChange={(e) => setFormData({ ...formData, letter_text: e.target.value })}
                  rows={12}
                  className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Write your cover letter here..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={isCreating ? handleCreate : () => handleUpdate(editingId!)}
                  disabled={isSaving}
                  className="bg-primary text-background font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : isCreating ? 'Create' : 'Update'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-accent text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cover Letters List */}
        <div className="space-y-4">
          {coverLetters.length === 0 ? (
            <div className="bg-surface rounded-lg p-12 text-center border border-accent">
              <p className="text-text-secondary text-lg">No cover letters yet</p>
              <p className="text-text-secondary text-sm mt-2">
                Create your first cover letter to get started
              </p>
            </div>
          ) : (
            coverLetters.map((coverLetter) => (
              <div
                key={coverLetter.id}
                className="bg-surface rounded-lg p-6 shadow-lg border border-accent hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {coverLetter.job_title || 'Untitled Cover Letter'}
                    </h3>
                    {coverLetter.company_name && (
                      <p className="text-text-secondary mb-2">
                        {coverLetter.company_name}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {coverLetter.tone}
                      </span>
                      <span>
                        {new Date(coverLetter.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {coverLetter.letter_text && (
                      <p className="text-foreground line-clamp-3">
                        {coverLetter.letter_text}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleDownloadPDF(coverLetter)}
                      className="bg-success/10 hover:bg-success/20 text-success font-medium px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleGenerateEmail(coverLetter)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary font-medium px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Generate Email
                    </button>
                    <button
                      onClick={() => handleEdit(coverLetter)}
                      className="bg-accent/50 hover:bg-accent text-foreground font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coverLetter.id)}
                      className="bg-error/10 hover:bg-error/20 text-error font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Email Generation Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-accent">
              <div className="sticky top-0 bg-surface border-b border-accent p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Professional Email Template</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-background rounded-lg p-4 border border-accent">
                  <p className="text-sm text-text-secondary mb-2">📧 Email Preview</p>
                  <pre className="text-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">
{generatedEmail}
                  </pre>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={openEmailClient}
                    className="bg-success text-background font-semibold px-6 py-3 rounded-lg hover:bg-success/90 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Open Email Client
                  </button>
                  <button
                    onClick={copyEmailToClipboard}
                    className="bg-primary text-background font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-full bg-accent text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/80 transition-all duration-200"
                >
                  Close
                </button>

                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h3 className="text-primary font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Use This Email
                  </h3>
                  <div className="text-sm text-foreground space-y-3 ml-7">
                    <div>
                      <p className="font-semibold text-success mb-1">✨ Quick Method (Recommended):</p>
                      <ul className="space-y-1">
                        <li>1. Click &quot;Open Email Client&quot; above</li>
                        <li>2. Your default email app will open with email pre-filled</li>
                        <li>3. Add recipient email address</li>
                        <li>4. Attach your resume and cover letter PDF</li>
                        <li>5. Review and send!</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">📋 Alternative Method:</p>
                      <ul className="space-y-1">
                        <li>1. Click &quot;Copy to Clipboard&quot;</li>
                        <li>2. Open Gmail/Outlook/etc. manually</li>
                        <li>3. Paste the email into compose window</li>
                        <li>4. Attach PDFs and send</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/30 rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips
                  </h3>
                  <ul className="text-sm text-text-secondary space-y-1 ml-7">
                    <li>• Personalize the email if you know the hiring manager&apos;s name</li>
                    <li>• Keep the subject line professional and clear</li>
                    <li>• Mention any referrals or connections to the company</li>
                    <li>• Double-check attachments before sending</li>
                    <li>• Send during business hours for better visibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

