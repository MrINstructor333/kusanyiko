import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateMember } from '../../store/slices/membersSlice';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  HomeIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  PencilIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Member } from '../../types';
import ProfilePicture from '../../components/ui/ProfilePicture';
import Camera from '../../components/ui/Camera';
import '../../styles/forms.css';
import '../../styles/mobile-members.css';

// All Tanzania regions (mainland and Zanzibar)
const ALL_TANZANIA_REGIONS = [
  'Arusha',
  'Dar es Salaam',
  'Dodoma', 
  'Geita',
  'Iringa',
  'Kagera',
  'Katavi',
  'Kigoma',
  'Kilimanjaro',
  'Lindi',
  'Manyara',
  'Mara',
  'Mbeya',
  'Morogoro',
  'Mtwara',
  'Mwanza',
  'Njombe',
  'Pwani',
  'Rukwa',
  'Ruvuma',
  'Shinyanga',
  'Simiyu',
  'Singida',
  'Songwe',
  'Tabora',
  'Tanga',
  'Kusini Unguja',
  'Kaskazini Unguja',
  'Mjini Magharibi',
  'Kaskazini Pemba',
  'Kusini Pemba'
];

// Dar es Salaam areas/centers
const DAR_ES_SALAAM_CENTERS = [
  'Mwenge',
  'Ushindi', 
  'Temeke',
  'Kinondoni',
  'Imara',
  'Yombo',
  'Kisukuru',
  'Zanzibar'
];

// Church position options
const CHURCH_POSITION_OPTIONS = [
  'Mtume Mkuu',
  'Msaidizi Binafsi wa Mtume Mkuu', 
  'Mtume',
  'Mchungaji Kiongozi',
  'Mchungaji',
  'Katibu',
  'Mtawala',
  'Askofu',
  'Cell Leader',
  'Mweka Hazina',
  'Mwanakamati',
  'Mjumbe wa Board',
  'Funguka',
  'ICT',
  'TV',
  'Sunday School Teacher',
  'Walinzi'
];

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  middle_name: yup.string().optional(),
  last_name: yup.string().required('Last name is required'),
  gender: yup.string().oneOf(['male', 'female'], 'Please select a gender').required('Gender is required'),
  age: yup.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120').required('Age is required'),
  marital_status: yup.string().oneOf(['single', 'married', 'divorced', 'widowed'], 'Please select marital status').required('Marital status is required'),
  saved: yup.boolean().required('Please indicate salvation status'),
  church_registration_number: yup.string().optional(),
  country: yup.string().required('Country is required'),
  region: yup.string().when('country', {
    is: 'Tanzania',
    then: (schema) => schema.required('Region is required when Tanzania is selected'),
    otherwise: (schema) => schema.optional()
  }),
  center_area: yup.string().optional(),
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
});

interface EditMemberFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'male' | 'female';
  age: number;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  saved: boolean;
  church_registration_number?: string;
  country: string;
  region?: string;
  center_area?: string;
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

const EditMember: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { members, loading } = useAppSelector((state) => state.members);
  
  const [member, setMember] = useState<Member | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFullForm, setShowFullForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    trigger,
    getValues,
  } = useForm<EditMemberFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      country: 'Tanzania',
      visitors_count: 0,
      origin: 'invited',
    },
  });

  const watchedCountry = watch('country');
  const watchedRegion = watch('region');
  const totalSteps = 4;

  const stepTitles = [
    'Personal Information',
    'Contact Details',
    'Church Information',
    'Review & Submit'
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      const foundMember = members.find(m => m.id === parseInt(id));
      if (foundMember) {
        setMember(foundMember);
        reset({
          first_name: foundMember.first_name,
          middle_name: foundMember.middle_name || '',
          last_name: foundMember.last_name,
          gender: foundMember.gender as 'male' | 'female',
          age: foundMember.age || 0,
          marital_status: foundMember.marital_status as any,
          saved: foundMember.saved,
          church_registration_number: foundMember.church_registration_number || '',
          country: foundMember.country || 'Tanzania',
          region: foundMember.region || '',
          center_area: foundMember.center_area || '',
          zone: foundMember.zone || '',
          cell: foundMember.cell || '',
          postal_address: foundMember.postal_address || '',
          mobile_no: foundMember.mobile_no,
          email: foundMember.email || '',
          church_position: foundMember.church_position || '',
          visitors_count: foundMember.visitors_count || 0,
          origin: foundMember.origin as 'invited' | 'efatha',
          residence: foundMember.residence || '',
          career: foundMember.career || '',
          attending_date: foundMember.attending_date || new Date().toISOString().split('T')[0]
        });
        
        if (foundMember.picture && typeof foundMember.picture === 'string') {
          setProfileImage(foundMember.picture);
        }
      }
    }
  }, [id, members, reset]);

  const handleBack = () => {
    const basePath = user?.role === 'admin' ? '/admin' : '/registrant';
    navigate(`${basePath}/members`);
  };

  const handleCameraCapture = (imageFile: File) => {
    setProfileFile(imageFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setProfileImage(result);
      }
    };
    reader.readAsDataURL(imageFile);
    setIsCameraOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setProfileImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof EditMemberFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['first_name', 'last_name', 'gender', 'age', 'marital_status'];
        break;
      case 2:
        fieldsToValidate = ['mobile_no', 'country', 'residence', 'zone', 'cell'];
        if (watchedCountry === 'Tanzania') {
          fieldsToValidate.push('region');
        }
        break;
      case 3:
        fieldsToValidate = ['saved', 'origin', 'attending_date'];
        break;
      case 4:
        return;
      default:
        return;
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: EditMemberFormData) => {
    if (!member?.id) return;
    
    try {
      setIsSubmitted(true);
      
      let submitData: FormData | EditMemberFormData;
      
      if (profileFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'church_registration_number' && value === '') {
              return;
            }
            if (key === 'region' && value === '' && data.country !== 'Tanzania') {
              return;
            }
            if (typeof value === 'boolean') {
              formData.append(key, value.toString());
            } else if (typeof value === 'number') {
              formData.append(key, value.toString());
            } else if (typeof value === 'string') {
              const optionalFields = ['middle_name', 'church_registration_number', 'center_area', 'postal_address', 'email', 'church_position', 'career'];
              if (optionalFields.includes(key) && value.trim() === '') {
                return;
              }
              if (key === 'region' && value.trim() === '' && data.country !== 'Tanzania') {
                return;
              }
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        formData.append('picture', profileFile);
        submitData = formData;
      } else {
        const cleanedData = { ...data };
        if (cleanedData.church_registration_number === '') {
          delete cleanedData.church_registration_number;
        }
        submitData = cleanedData;
      }

      const result = await dispatch(updateMember({ 
        id: member.id, 
        data: submitData 
      }));

      if (updateMember.fulfilled.match(result)) {
        setTimeout(() => {
          handleBack();
        }, 2000);
      } else {
        console.error('Failed to update member:', result.payload);
        alert('Failed to update member. Please try again.');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    } finally {
      setIsSubmitted(false);
    }
  };

  const handleFinalSubmit = async () => {
    const isFormValid = await trigger();
    
    if (isFormValid) {
      const formData = getValues();
      await onSubmit(formData);
    }
  };

  if (!member) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4`}>Member Not Found</h2>
            <p className={`text-gray-600 mb-6 ${isMobile ? 'text-sm' : ''}`}>The member you're trying to edit doesn't exist or has been removed.</p>
            <button
              onClick={handleBack}
              className={`${isMobile ? 'w-full' : 'inline-flex items-center'} px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors ${isMobile ? 'justify-center' : ''}`}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <div className={`bg-white rounded-2xl ${isMobile ? 'p-6' : 'p-8'} shadow-sm border border-gray-100 text-center`}>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>Member Updated Successfully!</h2>
            <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
              The member information has been updated in the system.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 text-sm">
                You will be redirected to the members page shortly...
              </p>
            </div>
            <button
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Return to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile rendering
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1 mx-4">
              Edit Member
            </h1>
            
            <button
              onClick={() => setShowFullForm(!showFullForm)}
              className="flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <span className="text-sm font-medium mr-1">
                {showFullForm ? 'Simple' : 'Full'}
              </span>
              <ChevronRightIcon className={`h-4 w-4 transition-transform ${showFullForm ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <ProfilePicture
                    src={member.picture}
                    firstName={member.first_name}
                    lastName={member.last_name}
                    size="md"
                    className="w-14 h-14 text-green-600"
                  />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CameraIcon className="h-3 w-3 text-white" />
              </button>
            </div>
            
            <div className="text-white flex-1">
              <h2 className="text-xl font-bold">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-green-100 text-sm">
                Update member information
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!showFullForm ? (
              /* Quick Edit Section */
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register('first_name')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register('last_name')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter last name"
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        {...register('mobile_no')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter mobile number"
                      />
                      {errors.mobile_no && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile_no.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      loading || !isValid
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                        Update Member
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Full Mobile Form */
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          {...register('first_name')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="First name"
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...register('last_name')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Last name"
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        {...register('middle_name')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Middle name (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          {...register('gender')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          {...register('age', { valueAsNumber: true })}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Age"
                          min="1"
                          max="120"
                        />
                        {errors.age && (
                          <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marital Status *
                      </label>
                      <select
                        {...register('marital_status')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select marital status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                      {errors.marital_status && (
                        <p className="text-red-500 text-sm mt-1">{errors.marital_status.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Salvation Status *
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register('saved')}
                            value="true"
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">Saved</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...register('saved')}
                            value="false"
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">Not Saved</span>
                        </label>
                      </div>
                      {errors.saved && (
                        <p className="text-red-500 text-sm mt-1">{errors.saved.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PhoneIcon className="h-5 w-5 text-green-600 mr-2" />
                    Contact Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        {...register('mobile_no')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter mobile number"
                      />
                      {errors.mobile_no && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile_no.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Email (optional)"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Address
                      </label>
                      <textarea
                        {...register('postal_address')}
                        rows={2}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="Postal address (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                    Location Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        {...register('country')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Country</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Malawi">Malawi</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Burundi">Burundi</option>
                        <option value="Republic of Congo">Republic of Congo</option>
                        <option value="Mozambique">Mozambique</option>
                        <option value="Botswana">Botswana</option>
                        <option value="South Africa">South Africa</option>
                        <option value="South Sudan">South Sudan</option>
                        <option value="UK">UK</option>
                        <option value="USA">USA</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="India">India</option>
                      </select>
                    </div>

                    {watchedCountry === 'Tanzania' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Region *
                        </label>
                        <select
                          {...register('region')}
                          className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select region</option>
                          {ALL_TANZANIA_REGIONS.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                        )}
                      </div>
                    )}

                    {watchedRegion === 'Dar es Salaam' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Center/Area
                        </label>
                        <select
                          {...register('center_area')}
                          className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select center/area</option>
                          {DAR_ES_SALAAM_CENTERS.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Residence *
                      </label>
                      <input
                        type="text"
                        {...register('residence')}
                        placeholder="Enter your residence"
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.residence && (
                        <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zone *
                        </label>
                        <input
                          {...register('zone')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Zone"
                        />
                        {errors.zone && (
                          <p className="text-red-500 text-xs mt-1">{errors.zone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cell *
                        </label>
                        <input
                          {...register('cell')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Cell"
                        />
                        {errors.cell && (
                          <p className="text-red-500 text-xs mt-1">{errors.cell.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Church Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <HomeIcon className="h-5 w-5 text-green-600 mr-2" />
                    Church Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Church Registration Number
                      </label>
                      <input
                        {...register('church_registration_number')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Registration number (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Church Position
                      </label>
                      <select
                        {...register('church_position')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select position (optional)</option>
                        {CHURCH_POSITION_OPTIONS.map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Career/Profession
                      </label>
                      <input
                        {...register('career')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Career (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Origin *
                        </label>
                        <select
                          {...register('origin')}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select</option>
                          <option value="invited">Invited</option>
                          <option value="efatha">EFATHA</option>
                        </select>
                        {errors.origin && (
                          <p className="text-red-500 text-xs mt-1">{errors.origin.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visitors Count
                        </label>
                        <input
                          type="number"
                          {...register('visitors_count', { valueAsNumber: true })}
                          className="mobile-form-input w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attending Date *
                      </label>
                      <input
                        type="date"
                        {...register('attending_date')}
                        className="mobile-form-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.attending_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.attending_date.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      loading || !isValid
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                        Update Member
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom padding for mobile */}
                <div className="h-16"></div>
              </div>
            )}
          </form>
        </div>

        {/* Camera Component */}
        <Camera
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </div>
    );
  }

  // Desktop rendering
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Members
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
                <PencilIcon className="h-8 w-8 text-green-500 mr-3" />
                Edit Member: {member.first_name} {member.last_name}
              </h1>
              <p className="text-gray-600 mt-2 text-center lg:text-left">
                Update member information in the EFATHA system
              </p>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                
                return (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                        : isCompleted
                        ? 'bg-green-100 text-green-600 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    {stepNumber < totalSteps && (
                      <div className={`w-12 h-1 rounded-full ml-2 ${
                        stepNumber < currentStep ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-green-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></span>
              {stepTitles[currentStep - 1]}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Update the required information for this section
            </p>
          </div>

          <form className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center mb-8 space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <ProfilePicture
                          src={member.picture}
                          firstName={member.first_name}
                          lastName={member.last_name}
                          size="lg"
                          className="w-20 h-20"
                        />
                      )}
                    </div>
                    
                    {/* Upload from files button */}
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg">
                      <CameraIcon className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Camera capture button */}
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg"
                      title="Take Photo"
                    >
                      <CameraIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Click 📷 to upload from files or 📸 to take photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('first_name')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter first name"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      {...register('middle_name')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter middle name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('last_name')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter last name"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter age"
                      min="1"
                      max="120"
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marital Status *
                    </label>
                    <select
                      {...register('marital_status')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select marital status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                    {errors.marital_status && (
                      <p className="text-red-500 text-sm mt-1">{errors.marital_status.message}</p>
                    )}
                  </div>
                </div>

                {/* Salvation Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Salvation Status *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors">
                      <input
                        type="radio"
                        {...register('saved')}
                        value="true"
                        className="form-radio w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium text-sm">Saved</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors">
                      <input
                        type="radio"
                        {...register('saved')}
                        value="false"
                        className="form-radio w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium text-sm">Not Saved</span>
                    </label>
                  </div>
                  {errors.saved && (
                    <p className="text-red-500 text-sm mt-1">{errors.saved.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <PhoneIcon className="h-4 w-4 text-green-500 mr-2" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      {...register('mobile_no')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter mobile number"
                    />
                    {errors.mobile_no && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobile_no.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-green-500 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Postal Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPinIcon className="h-4 w-4 text-green-500 mr-2" />
                    Postal Address
                  </label>
                  <textarea
                    {...register('postal_address')}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter postal address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-green-500 mr-2" />
                      Country *
                    </label>
                    <select
                      {...register('country')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select Country</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Republic of Congo">Republic of Congo</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Botswana">Botswana</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="UK">UK</option>
                      <option value="USA">USA</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="India">India</option>
                    </select>
                  </div>

                  {/* Region - Only show when Tanzania is selected */}
                  {watchedCountry === 'Tanzania' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Region *
                      </label>
                      <select
                        {...register('region')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="">Select region</option>
                        {ALL_TANZANIA_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Center/Area */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Center/Area
                    </label>
                    <select
                      {...register('center_area')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      disabled={watchedRegion !== 'Dar es Salaam'}
                    >
                      <option value="">Select center/area</option>
                      {watchedRegion === 'Dar es Salaam' && 
                        DAR_ES_SALAAM_CENTERS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))
                      }
                      {watchedRegion && watchedRegion !== 'Dar es Salaam' && (
                        <option value={watchedRegion}>{watchedRegion}</option>
                      )}
                    </select>
                  </div>

                  {/* Residence */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <HomeIcon className="h-4 w-4 text-green-500 mr-2" />
                      Residence *
                    </label>
                    <input
                      type="text"
                      {...register('residence')}
                      placeholder="Enter your residence"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                    {errors.residence && (
                      <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Zone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zone *
                    </label>
                    <input
                      {...register('zone')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter zone"
                    />
                    {errors.zone && (
                      <p className="text-red-500 text-sm mt-1">{errors.zone.message}</p>
                    )}
                  </div>

                  {/* Cell */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cell *
                    </label>
                    <input
                      {...register('cell')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter cell"
                    />
                    {errors.cell && (
                      <p className="text-red-500 text-sm mt-1">{errors.cell.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Church Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Church Registration Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <DocumentCheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      Church Registration Number
                    </label>
                    <input
                      {...register('church_registration_number')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter registration number (optional)"
                    />
                  </div>

                  {/* Church Position */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Church Position
                    </label>
                    <select
                      {...register('church_position')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select church position</option>
                      {CHURCH_POSITION_OPTIONS.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Career */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <BriefcaseIcon className="h-4 w-4 text-green-500 mr-2" />
                      Career/Profession
                    </label>
                    <input
                      {...register('career')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter career/profession"
                    />
                  </div>

                  {/* Visitors Count */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visitors Count
                    </label>
                    <input
                      type="number"
                      {...register('visitors_count', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter visitors count"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Origin *
                    </label>
                    <select
                      {...register('origin')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select origin</option>
                      <option value="invited">Invited</option>
                      <option value="efatha">EFATHA</option>
                    </select>
                    {errors.origin && (
                      <p className="text-red-500 text-sm mt-1">{errors.origin.message}</p>
                    )}
                  </div>

                  {/* Attending Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 text-green-500 mr-2" />
                      Attending Date *
                    </label>
                    <input
                      type="date"
                      {...register('attending_date')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                    {errors.attending_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.attending_date.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    Review Member Information
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Please review all the information before updating the member.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Full Name:</span>
                        <span className="ml-2 text-gray-900">
                          {watch('first_name')} {watch('middle_name')} {watch('last_name')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Gender:</span>
                        <span className="ml-2 text-gray-900 capitalize">{watch('gender')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Age:</span>
                        <span className="ml-2 text-gray-900">{watch('age')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Marital Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{watch('marital_status')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mobile:</span>
                        <span className="ml-2 text-gray-900">{watch('mobile_no')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900">{watch('email') || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Region:</span>
                        <span className="ml-2 text-gray-900">{watch('region')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Center/Area:</span>
                        <span className="ml-2 text-gray-900">{watch('center_area')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Church Reg. No:</span>
                        <span className="ml-2 text-gray-900">{watch('church_registration_number')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Origin:</span>
                        <span className="ml-2 text-gray-900 capitalize">{watch('origin')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Attending Date:</span>
                        <span className="ml-2 text-gray-900">{watch('attending_date')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Salvation Status:</span>
                        <span className="ml-2 text-gray-900">
                          {watch('saved') === true ? 'Saved' : watch('saved') === false ? 'Not Saved' : 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Once submitted, the member information will be updated in the church database. 
                    Make sure all information is correct before proceeding.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading || !isValid}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    loading || !isValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Member'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Camera Component */}
      <Camera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default EditMember;