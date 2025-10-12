# Job Portal - User Site

A modern job portal application built with Next.js 15, TypeScript, and Tailwind CSS, featuring a sleek Binance-inspired dark theme.

## Features

- **Job Listings**: Browse and search for jobs with advanced filtering
- **Job Details**: View comprehensive job information including responsibilities, requirements, and benefits
- **Categories**: Explore jobs by category
- **Suggest Category**: Propose new job categories
- **Feedback System**: Submit feedback and feature requests
- **Contact Page**: Get in touch with the team
- **Responsive Design**: Works seamlessly on all devices
- **Dark Theme**: Eye-friendly dark interface with yellow accents

## Color Scheme

- **Primary**: `#FCD535` (Binance Yellow)
- **Primary Dark**: `#CBAF27`
- **Background**: `#0B0E11`
- **Surface**: `#181A20`
- **Text Primary**: `#EAECEF`
- **Text Secondary**: `#A1A5B0`
- **Success**: `#28C76F`
- **Error**: `#EA5455`

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd job-portal-user
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
job-portal-user/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage with job listings
│   │   ├── jobs/[id]/         # Job details page
│   │   ├── categories/        # Categories page
│   │   ├── suggest/           # Suggest category form
│   │   ├── feedback/          # Feedback form
│   │   ├── contact/           # Contact page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   └── components/
│       ├── Navbar.tsx         # Navigation component
│       └── JobCard.tsx        # Job card component
```

## Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Icons**: Heroicons (SVG)

## Customization

### Changing Colors

Edit the CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: #FCD535;
  --background: #0B0E11;
  /* ... other colors */
}
```

### Adding Pages

Create new pages in the `src/app` directory following Next.js 15 App Router conventions.

## Future Enhancements

- User authentication
- Job application submission
- Save favorite jobs
- Email notifications
- Advanced search filters
- Integration with backend API

## License

MIT

## Support

For support, email support@jobportal.com
