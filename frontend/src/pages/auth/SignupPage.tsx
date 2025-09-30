import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { signupUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { SignupData } from '../../types';
import { Button, Input, Select, Card } from '../../components/ui';
import { toast } from 'react-toastify';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  username: yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirm_password: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: SignupData) => {
    try {
      const result = await dispatch(signupUser(data));
      if (signupUser.fulfilled.match(result)) {
        toast.success(result.payload.message || 'Account created successfully! You are now logged in.');
        // Navigate to dashboard since user is now automatically logged in
        navigate('/dashboard');
      } else {
        toast.error(result.payload as string || 'Signup failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join the EFATHA registration team
          </p>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              New accounts receive admin privileges automatically
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Personal Information */}
          <div className="auth-row">
            <div className="auth-input-group">
              <label className="auth-label">First Name</label>
              <input
                type="text"
                placeholder="Enter your first name"
                className={`auth-input ${errors.first_name ? 'error' : ''}`}
                {...register('first_name', { required: 'First name is required' })}
              />
              {errors.first_name && (
                <div className="auth-error">
                  ⚠️ {errors.first_name.message}
                </div>
              )}
            </div>
            
            <div className="auth-input-group">
              <label className="auth-label">Last Name</label>
              <input
                type="text"
                placeholder="Enter your last name"
                className={`auth-input ${errors.last_name ? 'error' : ''}`}
                {...register('last_name', { required: 'Last name is required' })}
              />
              {errors.last_name && (
                <div className="auth-error">
                  ⚠️ {errors.last_name.message}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="auth-input-group">
            <label className="auth-label">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className={`auth-input ${errors.username ? 'error' : ''}`}
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
            />
            {errors.username && (
              <div className="auth-error">
                ⚠️ {errors.username.message}
              </div>
            )}
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className={`auth-input ${errors.email ? 'error' : ''}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format'
                }
              })}
            />
            {errors.email && (
              <div className="auth-error">
                ⚠️ {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div className="auth-row">
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div className="auth-error">
                  ⚠️ {errors.password.message}
                </div>
              )}
            </div>
            
            <div className="auth-input-group">
              <label className="auth-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`auth-input ${errors.confirm_password ? 'error' : ''}`}
                  {...register('confirm_password', { 
                    required: 'Please confirm your password'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && (
                <div className="auth-error">
                  ⚠️ {errors.confirm_password.message}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="auth-error text-center">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="auth-spinner" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <div className="text-center">
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;