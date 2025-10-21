# Resume Builder Templates Guide

## Overview

Created 16 ATS-friendly resume templates that follow industry best practices and align with the database schema for the Resume Builder feature.

## Database Schema Mapping

All templates are designed to accommodate the following data structure from `resume-builder-schema.sql`:

### Personal Information
- `full_name` - Displayed as main heading (H1)
- `email` - Contact information section
- `phone` - Contact information section
- `city` - Contact information section
- `address` - Contact information section (optional)

### Career Objective
- `career_objective` - Professional summary/objective section

### Education
- `institute_name` - Institution name
- `degree` - Degree/qualification
- `start_year` / `end_year` - Education timeline
- `grade` - GPA or grade achieved

### Experience
- `job_title` - Position title
- `company_name` - Company/organization
- `start_date` / `end_date` - Employment period
- `description` - Job responsibilities and achievements (supports bullet points)

### Skills
- `skill_name` - Individual skills listed with formatting

### Languages
- `language_name` - Languages with proficiency levels

### Certifications
- `title` - Certification name
- `year` - Year obtained

### Resume Metadata
- `template_name` - Template selection (template01_classic through template16_advanced)
- `profile_picture_url` - Not currently displayed (ATS compatibility)

## Template List

| ID | Name | Best For | Style |
|---|---|---|---|
| template01_classic | Classic Professional | General use, experienced professionals | Traditional, clean layout |
| template02_modern | Modern Clean | Tech professionals, modern industries | Modern spacing, subtle highlights |
| template03_creative | Creative Portfolio | Designers, creative roles | Project-focused, visual appeal |
| template04_minimal | Minimal Resume | Students, entry-level | Simple, whitespace-heavy |
| template05_professional | Professional Modern | Business analysts, managers | Professional with subtle lines |
| template06_tech | Tech Resume | Developers, DevOps, IT | Technical skills emphasized |
| template07_portfolio | Portfolio Style | Freelancers, developers | Projects highlighted first |
| template08_experienced | Experienced Professional | Mid to senior level | Emphasis on achievements |
| template09_startup | Startup Friendly | Startup culture, growth roles | Modern, concise, versatile |
| template10_student | Student Resume | Students, recent graduates | Education-first layout |
| template11_freelancer | Freelancer Style | Freelancers, contractors | Project and client focused |
| template12_manager | Manager Resume | Management positions | Leadership achievements |
| template13_design | Design Portfolio | Creative directors, designers | Clean project showcase |
| template14_engineer | Engineer Style | Licensed professionals, engineers | Certifications emphasized |
| template15_innovator | Innovator Resume | Researchers, innovators | Innovation projects first |
| template16_advanced | Portfolio Advanced | Full-stack, versatile roles | Comprehensive, balanced |

## ATS Compliance Features

All templates strictly follow ATS (Applicant Tracking System) requirements:

✅ **Single-column layout** - No complex multi-column designs
✅ **Standard headings** - Experience, Education, Skills, Certifications, etc.
✅ **Plain text** - All important information in readable text format
✅ **Standard fonts** - Arial, Calibri, Times New Roman
✅ **Minimal colors** - No background colors that interfere with text
✅ **No tables** - Simple div-based layouts
✅ **Simple bullets** - Standard HTML list formatting
✅ **Contact info in text** - Phone, email, location as plain text
✅ **PDF-ready** - Can be printed/exported with embedded text

## Implementation

### Lazy Loading
Templates are NOT preloaded. They are fetched only when:
1. User clicks "Browse Templates"
2. User clicks on a specific template card
3. Template HTML is loaded via fetch API from `/templates/{template_id}/index.html`

### Preview Images
Currently using placeholder icons. Preview images can be added later by:
1. Taking screenshots of each template
2. Saving as `preview.jpg` in each template folder
3. Updating the fetch to load preview images when modal opens

### File Structure
```
public/
└── templates/
    ├── template01_classic/
    │   └── index.html
    ├── template02_modern/
    │   └── index.html
    ├── template03_creative/
    │   └── index.html
    ... (continues for all 16 templates)
```

## Next Steps for Full Integration

1. **Create Resume Builder Form** - Form to collect all user data matching schema fields
2. **Data Population** - JavaScript to populate template HTML with user data
3. **PDF Generation** - Convert populated HTML to downloadable PDF
4. **Save to Database** - Store user resume data via API
5. **Preview Images** - Add actual preview screenshots for each template
6. **Template Selection** - Link "Use This Template" button to form with pre-selected template

## Usage in Resume Builder Page

The main page (`/resume-builder/page.tsx`) includes:
- Template browser modal triggered by "Browse Templates" button
- Grid display of all 16 templates with descriptions
- Lazy loading when user clicks a template
- Template preview with HTML rendering
- "Use This Template" button for selection (ready for integration)

## Demo Data

Each template includes realistic demo data showing:
- Professional formatting examples
- Proper spacing and typography
- How different sections should be structured
- Bullet point formatting for achievements
- Multiple entries for experience/education/certifications

This demo data should be replaced with actual user data when generating real resumes.

