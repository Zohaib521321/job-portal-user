# Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in the `job-portal-user` directory with the following:

```env
# API Configuration for auth endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_KEY=test123456789
```

## URL Structure

- **Login/Auth**: `/auth/login` - All authentication flows (sign in, sign up, OTP verification, forgot password)
- **Resume Builder**: `/resume-builder` - Protected route for authenticated users
- **Home**: `/` - Public home page

## Authentication Flow

### 1. Sign In Flow
- User enters email and password at `/auth/login`
- **If email not verified**: System sends OTP automatically and switches to verification mode
- **If email verified**: System validates credentials and generates JWT token
- JWT token is stored in localStorage
- User is redirected to `/resume-builder`

### 2. Sign Up Flow
- User enters full name, email, and password at `/auth/login`
- System sends OTP to email
- User verifies email with OTP code
- After verification, user can sign in

### 3. Forgot Password Flow
- User clicks "Forgot Password" at `/auth/login`
- User enters email address
- System sends OTP to email
- User enters OTP and new password
- Password is reset successfully
- User can then sign in

### 4. Resume Builder Access
- **If user is logged in**: Shows "Resume Builder" link in navbar
- **If user is not logged in**: Shows "Login" link in navbar (goes to `/auth/login`)

## Features Implemented

### Navbar Integration
- Conditional display based on authentication status
- "Resume Builder" for authenticated users
- "Login" for unauthenticated users

### Complete Authentication System
- User registration with email verification
- Login with JWT tokens
- Password reset with OTP verification
- Protected routes (Resume Builder)
- Automatic redirects based on auth status

### API Integration
- All authentication endpoints connected
- Error handling and loading states
- Token management with localStorage
- Automatic token refresh

## Usage

1. **Start the backend server** (port 4000)
2. **Start the frontend server** (port 3000)
3. **Navigate to the website**
4. **Click "Login" in the navbar** (if not authenticated)
5. **Choose between Sign In or Sign Up**
6. **Complete the authentication flow**
7. **Access Resume Builder** (after authentication)

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

## Security Features

- JWT token authentication
- API key authentication for all endpoints
- Password hashing with bcrypt
- OTP verification for email and password reset
- Protected routes with automatic redirects
- Secure token storage in localStorage
- Input validation and error handling

## API Key Authentication

All API requests now require the `x-api-key` header with the value `test123456789`. This is automatically included in all requests made through the AuthContext.

**Important**: Make sure to set the `NEXT_PUBLIC_API_KEY` environment variable in your `.env.local` file.
