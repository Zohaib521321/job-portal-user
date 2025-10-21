/**
 * PDF Download Utilities
 * Functions for generating and downloading PDFs from HTML templates
 */

interface DownloadPDFOptions {
  filename?: string;
  autoPrint?: boolean;
}

/**
 * Generate PDF from HTML content
 * Opens HTML in new window and triggers browser's print dialog
 */
export function downloadHTMLAsPDF(
  htmlContent: string,
  options: DownloadPDFOptions = {}
): void {
  const { filename = 'document', autoPrint = true } = options;

  // Open in new window
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to download PDF');
    return;
  }

  // Write HTML content
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.document.title = filename;
  
  // Focus window
  printWindow.focus();

  // Wait for content to load, then print
  if (autoPrint) {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Load template file and replace placeholders
 */
export async function loadTemplate(
  templatePath: string,
  replacements: Record<string, string>
): Promise<string> {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    
    let template = await response.text();

    // Replace all placeholders
    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value);
    });

    return template;
  } catch (error) {
    console.error('Template loading error:', error);
    throw new Error('Failed to load template');
  }
}

/**
 * Format text content for HTML
 * Converts line breaks to paragraphs
 */
export function formatTextToHTML(
  text: string,
  paragraphClass: string = 'paragraph'
): string {
  if (!text) return '';
  
  return text
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<div class="${paragraphClass}">${p}</div>`)
    .join('');
}

/**
 * Format date for documents
 */
export function formatDate(date: Date | string = new Date()): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Download resume as PDF
 */
export async function downloadResumeAsPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resumeData: any,
  templateName: string = 'template01_classic'
): Promise<void> {
  try {
    const templatePath = `/templates/${templateName}/index.html`;
    
    // Build replacement map
    const replacements: Record<string, string> = {
      FULL_NAME: resumeData.personal_info?.full_name || 'Your Name',
      EMAIL: resumeData.personal_info?.email || '',
      PHONE: resumeData.personal_info?.phone || '',
      CITY: resumeData.personal_info?.city || '',
      ADDRESS: resumeData.personal_info?.address || '',
      CAREER_OBJECTIVE: resumeData.career_objective || '',
      // Add more fields as needed
    };

    const html = await loadTemplate(templatePath, replacements);
    
    downloadHTMLAsPDF(html, {
      filename: `Resume_${resumeData.title || 'Document'}.pdf`,
      autoPrint: true
    });
  } catch (error) {
    console.error('Resume PDF generation error:', error);
    throw error;
  }
}

/**
 * Download cover letter as PDF
 */
export async function downloadCoverLetterAsPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverLetterData: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalInfo: any
): Promise<void> {
  try {
    const replacements: Record<string, string> = {
      APPLICANT_NAME: personalInfo?.full_name || 'Your Name',
      APPLICANT_EMAIL: personalInfo?.email || 'your.email@example.com',
      APPLICANT_PHONE: personalInfo?.phone || 'Your Phone',
      APPLICANT_ADDRESS: personalInfo?.address || 'Your Address',
      DATE: formatDate(),
      COMPANY_NAME: coverLetterData.company_name || 'Company Name',
      LETTER_TEXT: formatTextToHTML(coverLetterData.letter_text || '', 'paragraph'),
    };

    const html = await loadTemplate('/templates/cover-letter-template.html', replacements);
    
    downloadHTMLAsPDF(html, {
      filename: `CoverLetter_${coverLetterData.company_name || 'Document'}.pdf`,
      autoPrint: true
    });
  } catch (error) {
    console.error('Cover letter PDF generation error:', error);
    throw error;
  }
}

