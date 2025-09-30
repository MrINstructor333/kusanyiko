import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CameraIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { AppDispatch } from '../../store';
import { createMember } from '../../store/slices/membersSlice';
import { TANZANIA_REGIONS, DAR_ES_SALAAM_AREAS } from '../../services/api';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  middle_name: yup.string().optional(),
  last_name: yup.string().required('Last name is required'),
  gender: yup.string().oneOf(['male', 'female'], 'Please select a gender').required('Gender is required'),
  age: yup.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120').required('Age is required'),
  marital_status: yup.string().oneOf(['single', 'married', 'divorced', 'widowed'], 'Please select marital status').required('Marital status is required'),
  saved: yup.boolean().required('Please indicate salvation status'),
  church_registration_number: yup.string().required('Church registration number is required'),
  country: yup.string().required('Country is required'),
  region: yup.string().required('Region is required'),
  center_area: yup.string().required('Center/Area is required'),
  zone: yup.string().required('Zone is required'),
  cell: yup.string().required('Cell is required'),
  postal_address: yup.string().optional(),
  mobile_no: yup.string().required('Mobile number is required'),
  email: yup.string().email('Invalid email format').optional(),
  church_position: yup.string().optional(),
  visitors_count: yup.number().min(0, 'Visitors count cannot be negative').default(0),
  origin: yup.string().oneOf(['invited', 'efatha'], 'Please select origin').required('Origin is required'),
  residence: yup.string().required('Residence is required'),
  career: yup.string().optional(),
  attending_date: yup.string().required('Attending date is required')
}) as yup.ObjectSchema<MemberFormData>;

interface MemberFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'male' | 'female';
  age: number;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  saved: boolean;
  church_registration_number: string;
  country: string;
  region: string;
  center_area: string;
  zone: string;
  cell: string;
  postal_address?: string;
  mobile_no: string;
  email?: string;
  church_position?: string;
  visitors_count: number;
  origin: 'invited' | 'efatha';
  residence: string;
  career?: string;
  attending_date: string;
}

interface MemberRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState(1);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<MemberFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      visitors_count: 0,
      attending_date: new Date().toISOString().split('T')[0]
    }
  });

  const watchCountry = watch('country');
  const watchRegion = watch('region');
  const isDarEsSalaam = watchRegion === 'dar_es_salaam';

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Church Info' },
    { id: 3, title: 'Location' },
    { id: 4, title: 'Contact & Other' },
    { id: 5, title: 'Photo & Review' }
  ];

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPictureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append picture if selected
      if (pictureFile) {
        formData.append('picture', pictureFile);
      }

      await dispatch(createMember(formData));
      
      // Reset form and close
      reset();
      setPicturePreview(null);
      setPictureFile(null);
      setCurrentStep(1);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-secondary-900/50 backdrop-blur-sm" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-secondary-200/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Register New Member</h2>
              <p className="text-secondary-600">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100/50 rounded-xl transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    step.id === currentStep ? 'text-primary-600' :
                    step.id < currentStep ? 'text-success-600' : 'text-secondary-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep ? 'bg-primary-500 text-white' :
                    step.id < currentStep ? 'bg-success-500 text-white' : 'bg-secondary-200 text-secondary-600'
                  }`}>
                    {step.id < currentStep ? <CheckIcon className="h-4 w-4" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('first_name')}
                    className={`glass-input ${errors.first_name ? 'border-red-500' : ''}`}
                  />
                  {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Middle Name</label>
                  <input
                    {...register('middle_name')}
                    className={`glass-input ${errors.middle_name ? 'border-red-500' : ''}`}
                  />
                  {errors.middle_name && <span className="form-error">{errors.middle_name.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('last_name')}
                    className={`glass-input ${errors.last_name ? 'border-red-500' : ''}`}
                  />
                  {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className={`glass-input ${errors.gender ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <span className="form-error">{errors.gender.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className={`glass-input ${errors.age ? 'border-red-500' : ''}`}
                  />
                  {errors.age && <span className="form-error">{errors.age.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('marital_status')}
                    className={`glass-input ${errors.marital_status ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                  {errors.marital_status && <span className="form-error">{errors.marital_status.message}</span>}
                </div>
              </div>
            )}

            {/* Step 2: Church Info */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Salvation Status (Ameokoka?) <span className="text-danger-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('saved')}
                        value="true"
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-secondary-900">Yes (Saved)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('saved')}
                        value="false"
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-secondary-900">No (Not saved)</span>
                    </label>
                  </div>
                  {errors.saved && <p className="text-danger-500 text-sm mt-1">{errors.saved.message}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Church Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('church_registration_number')}
                    className={`glass-input ${errors.church_registration_number ? 'border-red-500' : ''}`}
                  />
                  {errors.church_registration_number && <span className="form-error">{errors.church_registration_number.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Church Position</label>
                  <input
                    {...register('church_position')}
                    placeholder="e.g., Deacon, Elder, Member"
                    className={`glass-input ${errors.church_position ? 'border-red-500' : ''}`}
                  />
                  {errors.church_position && <span className="form-error">{errors.church_position.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Origin <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('origin')}
                    className={`glass-input ${errors.origin ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Origin</option>
                    <option value="invited">Invited</option>
                    <option value="efatha">Efatha</option>
                  </select>
                  {errors.origin && <span className="form-error">{errors.origin.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Visitors Count</label>
                  <input
                    type="number"
                    {...register('visitors_count', { valueAsNumber: true })}
                    placeholder="0"
                    className={`glass-input ${errors.visitors_count ? 'border-red-500' : ''}`}
                  />
                  {errors.visitors_count && <span className="form-error">{errors.visitors_count.message}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('country')}
                    placeholder="e.g., Tanzania"
                    className={`glass-input ${errors.country ? 'border-red-500' : ''}`}
                  />
                  {errors.country && <span className="form-error">{errors.country.message}</span>}
                </div>
                
                {watchCountry?.toLowerCase() === 'tanzania' ? (
                  <div className="form-group">
                    <label className="form-label">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('region')}
                      className={`glass-input ${errors.region ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Region</option>
                      {TANZANIA_REGIONS.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                    {errors.region && <span className="form-error">{errors.region.message}</span>}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">
                      Region/State <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('region')}
                      className={`glass-input ${errors.region ? 'border-red-500' : ''}`}
                    />
                    {errors.region && <span className="form-error">{errors.region.message}</span>}
                  </div>
                )}

                {isDarEsSalaam ? (
                  <div className="form-group">
                    <label className="form-label">
                      Area (Dar es Salaam) <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('center_area')}
                      className={`glass-input ${errors.center_area ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Area</option>
                      {DAR_ES_SALAAM_AREAS.map((area) => (
                        <option key={area.value} value={area.value}>
                          {area.label}
                        </option>
                      ))}
                    </select>
                    {errors.center_area && <span className="form-error">{errors.center_area.message}</span>}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">
                      Center/Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('center_area')}
                      className={`glass-input ${errors.center_area ? 'border-red-500' : ''}`}
                    />
                    {errors.center_area && <span className="form-error">{errors.center_area.message}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('zone')}
                    className={`glass-input ${errors.zone ? 'border-red-500' : ''}`}
                  />
                  {errors.zone && <span className="form-error">{errors.zone.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Cell <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('cell')}
                    className={`glass-input ${errors.cell ? 'border-red-500' : ''}`}
                  />
                  {errors.cell && <span className="form-error">{errors.cell.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Residence <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('residence')}
                    className={`glass-input ${errors.residence ? 'border-red-500' : ''}`}
                  />
                  {errors.residence && <span className="form-error">{errors.residence.message}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Contact & Other */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('mobile_no')}
                    placeholder="+255 XXX XXX XXX"
                    className={`glass-input ${errors.mobile_no ? 'border-red-500' : ''}`}
                  />
                  {errors.mobile_no && <span className="form-error">{errors.mobile_no.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`glass-input ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>
                
                <div className="md:col-span-2 form-group">
                  <label className="form-label">Postal Address</label>
                  <textarea
                    {...register('postal_address')}
                    rows={3}
                    className={`glass-input ${errors.postal_address ? 'border-red-500' : ''}`}
                    placeholder="P.O. Box 123, City, Country"
                  />
                  {errors.postal_address && <span className="form-error">{errors.postal_address.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Career</label>
                  <input
                    {...register('career')}
                    placeholder="e.g., Teacher, Engineer, Student"
                    className={`glass-input ${errors.career ? 'border-red-500' : ''}`}
                  />
                  {errors.career && <span className="form-error">{errors.career.message}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Attending Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('attending_date')}
                    className={`glass-input ${errors.attending_date ? 'border-red-500' : ''}`}
                  />
                  {errors.attending_date && <span className="form-error">{errors.attending_date.message}</span>}
                </div>
              </div>
            )}

            {/* Step 5: Photo & Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-secondary-700 mb-4">
                    Member Photo (Optional)
                  </label>
                  <div className="flex flex-col items-center space-y-4">
                    {picturePreview ? (
                      <div className="relative">
                        <img
                          src={picturePreview}
                          alt="Member preview"
                          className="w-32 h-32 rounded-2xl object-cover border border-secondary-200/50 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPicturePreview(null);
                            setPictureFile(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-secondary-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary-300">
                        <CameraIcon className="h-8 w-8 text-secondary-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                      id="picture-upload"
                    />
                    <label
                      htmlFor="picture-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
                    >
                      <CameraIcon className="h-5 w-5 mr-2" />
                      {picturePreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                  </div>
                </div>

                <div className="bg-secondary-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Review Information</h3>
                  <p className="text-secondary-600 mb-4">
                    Please review all the information before submitting the registration.
                  </p>
                  <div className="text-sm text-secondary-600">
                    <p>• Ensure all required fields are completed</p>
                    <p>• Verify contact information is accurate</p>
                    <p>• Confirm church registration number is correct</p>
                    <p>• Check that the attending date is correct</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-secondary-200/50">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                    : 'bg-white border border-secondary-200/50 text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white border border-secondary-200/50 text-secondary-700 rounded-xl font-medium hover:bg-secondary-50 transition-all duration-200"
                >
                  Cancel
                </button>
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl font-medium hover:from-success-600 hover:to-success-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Complete Registration
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberRegistrationForm;