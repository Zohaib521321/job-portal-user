# API Key Setup Guide

## Environment Variables Required

Create a `.env.local` file in the `job-portal-user` directory with the following configuration:

```env
# API Configuration for auth endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_KEY=test123456789
```

## Backend API Key Configuration

The backend server is already configured to require API key authentication for all routes. The current configuration in `server.js` includes:

```javascript
// All routes require API key authentication
app.use('/api/auth', authLimiter, verifyApiKey, authRoutes);
app.use('/api/resumes', generalLimiter, verifyApiKey, resumeRoutes);
app.use('/api/resumes', generalLimiter, verifyApiKey, resumeDetailRoutes);
app.use('/api/templates', readLimiter, verifyApiKey, templateRoutes);
app.use('/api/cover-letters', generalLimiter, verifyApiKey, coverLetterRoutes);
```

## Frontend Implementation

The `AuthContext` has been updated to automatically include the API key in all requests:

```typescript
const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY, // Automatically included
};
```

## How It Works

1. **Backend**: All API routes are protected with `verifyApiKey` middleware
2. **Frontend**: All requests automatically include the `x-api-key` header
3. **Security**: The API key `test123456789` is required for all API calls
4. **Environment**: The API key is loaded from `NEXT_PUBLIC_API_KEY` environment variable

## Testing the Setup

1. **Start the backend server**:
   ```bash
   cd job-portal-backend
   npm run dev
   ```

2. **Start the frontend server**:
   ```bash
   cd job-portal-user
   npm run dev
   ```

3. **Test authentication**:
   - Navigate to the login page
   - Try to sign up or sign in
   - All requests should work with the API key automatically included

## Error Handling

If you see the error: "API key is required. Please provide a valid API key in the x-api-key header. Your valid API key is: test123456789"

This means:
1. The backend is running and expecting the API key
2. The frontend might not have the correct environment variable set
3. Make sure your `.env.local` file contains `NEXT_PUBLIC_API_KEY=test123456789`

## Security Notes

- The API key is currently set to `test123456789` for development
- In production, use a more secure API key
- The API key is included in all requests automatically
- No manual configuration needed in components
