import React, { useState } from 'react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

const ForgotPassword = ({ switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Reset link sent! Check your terminal/console if SMTP not set.');
      // Agar real email nahi hai to terminal check karne ko bolein
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="font-medium text-green-600 transition-colors hover:text-green-500 focus:outline-none"
          >
            Sign in
          </button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Enter your email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field w-full transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full transform py-3 text-lg shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </>
  );
};

export default ForgotPassword;