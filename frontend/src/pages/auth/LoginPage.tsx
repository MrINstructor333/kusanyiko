import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { loginUser } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types';
import { toast } from 'react-toastify';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Welcome back! Login successful.');
        // Navigation will be handled by the AppRouter based on user role
      } else {
        toast.error(result.payload as string || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to your EFATHA account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Username Field */}
          <div className="auth-input-group">
            <label className="auth-label">Username or Email</label>
            <input
              type="text"
              placeholder="Enter your username or email"
              className={`auth-input ${errors.username ? 'error' : ''}`}
              {...register('username', { required: 'Username or email is required' })}
            />
            {errors.username && (
              <div className="auth-error">
                ⚠️ {errors.username.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`auth-input ${errors.password ? 'error' : ''}`}
                {...register('password', { required: 'Password is required' })}
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

          {/* Remember Me */}
          <div className="auth-checkbox-group">
            <input
              type="checkbox"
              className="auth-checkbox"
              {...register('remember_me')}
            />
            <span className="text-sm text-gray-600">Remember me</span>
            <Link 
              to="/forgot-password" 
              className="auth-link ml-auto text-sm"
            >
              Forgot password?
            </Link>
          </div>

          {/* Member Search Link */}
          <div className="text-center">
            <Link 
              to="/member-search" 
              className="auth-link text-sm"
            >
              🔍 Search Members
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="auth-spinner" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <div className="text-center">
          <Link to="/signup" className="auth-link">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;