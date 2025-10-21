'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'otp-verify' | 'reset-password';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp_code: '',
    new_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register, verifyEmail, resendOtp, forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/resume-builder');
      }, 1500);
    } catch (error) {
      // Check if verification is required
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      if (errorMessage.startsWith('VERIFICATION_REQUIRED:')) {
        const actualMessage = errorMessage.replace('VERIFICATION_REQUIRED: ', '');
        setSuccess(actualMessage);
        setMode('otp-verify');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.full_name, formData.email, formData.password);
      setSuccess('Registration successful! Please check your email for verification code.');
      setMode('otp-verify');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(formData.email);
      setSuccess('Password reset code sent to your email!');
      setMode('otp-verify');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'otp-verify') {
        await verifyEmail(formData.email, formData.otp_code);
        setSuccess('Email verified successfully! You can now login.');
        setMode('signin');
      } else if (mode === 'reset-password') {
        await resetPassword(formData.email, formData.otp_code, formData.new_password);
        setSuccess('Password reset successfully! You can now login.');
        setMode('signin');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const purpose = mode === 'reset-password' ? 'password_reset' : 'signup_verification';
      await resendOtp(formData.email, purpose);
      setSuccess('OTP code resent to your email!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp_code: '',
      new_password: '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot-password' && 'Reset your password'}
            {mode === 'otp-verify' && 'Verify your email'}
            {mode === 'reset-password' && 'Set new password'}
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            {mode === 'signin' && "Don't have an account? "}
            {mode === 'signup' && 'Already have an account? '}
            {mode === 'forgot-password' && 'Remember your password? '}
            {mode === 'otp-verify' && 'Didn\'t receive the code? '}
            {mode === 'reset-password' && 'Remember your password? '}
            
            {mode === 'signin' && (
              <button
                onClick={() => { setMode('signup'); resetForm(); }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign up
              </button>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => { setMode('signin'); resetForm(); }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </button>
            )}
            {mode === 'forgot-password' && (
              <button
                onClick={() => { setMode('signin'); resetForm(); }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </button>
            )}
            {mode === 'otp-verify' && (
              <button
                onClick={handleResendOtp}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Resend code
              </button>
            )}
            {mode === 'reset-password' && (
              <button
                onClick={() => { setMode('signin'); resetForm(); }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </button>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={
          mode === 'signin' ? handleSignIn :
          mode === 'signup' ? handleSignUp :
          mode === 'forgot-password' ? handleForgotPassword :
          handleOtpVerify
        }>
          <div className="space-y-4">
            {/* Full Name - Only for signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email - All modes except reset-password */}
            {mode !== 'reset-password' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Enter your email"
                />
              </div>
            )}

            {/* Password - Signin, signup, reset-password */}
            {(mode === 'signin' || mode === 'signup' || mode === 'reset-password') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {/* Confirm Password - Only for signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* New Password - Only for reset-password */}
            {mode === 'reset-password' && (
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Enter your new password"
                />
              </div>
            )}

            {/* OTP Code - For otp-verify and reset-password */}
            {(mode === 'otp-verify' || mode === 'reset-password') && (
              <div>
                <label htmlFor="otp_code" className="block text-sm font-medium text-foreground">
                  Verification Code
                </label>
                <input
                  id="otp_code"
                  name="otp_code"
                  type="text"
                  required
                  value={formData.otp_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary bg-surface text-foreground"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            )}
          </div>

          {/* Forgot Password Link - Only for signin */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode('forgot-password'); resetForm(); }}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Sign Up'}
                  {mode === 'forgot-password' && 'Send Reset Code'}
                  {mode === 'otp-verify' && 'Verify Email'}
                  {mode === 'reset-password' && 'Reset Password'}
                </>
              )}
            </button>
          </div>

          {/* Back to Home */}
          {/* <div className="text-center">
            <Link href="/" className="text-sm text-text-secondary hover:text-foreground">
              ← Back to Home
            </Link>
          </div> */}
        </form>
      </div>
    </div>
  );
}
