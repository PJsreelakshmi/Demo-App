// import './App.css'
import React, { useState, useRef, useCallback } from 'react';
import EasyCrop from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  photoUrl: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  website: string;
  skills: string[];
  resumeUrl: string;
  resumeName: string;
  education: Education[];
  experience: Experience[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

const ProfilePage: React.FC = () => {
  // State for profile data
  const [profile, setProfile] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Frontend developer with passion for React and TypeScript',
    photoUrl: '',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    phone: '(555) 123-4567',
    website: 'johndoe.dev',
    skills: ['React', 'TypeScript', 'HTML/CSS', 'Node.js'],
    resumeUrl: '',
    resumeName: '',
    education: [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startYear: '2016',
        endYear: '2020'
      }
    ],
    experience: [
      {
        company: 'Tech Solutions Inc.',
        position: 'Frontend Developer',
        startDate: '2020-06',
        endDate: 'present',
        description: 'Developing and maintaining web applications using React and TypeScript.'
      }
    ]
  });
  
  // Active section for editing
  const [activeSection, setActiveSection] = useState<string>('personal');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for skills input
  const [newSkill, setNewSkill] = useState('');
  
  // States for adding new items
  const [newEducation, setNewEducation] = useState<Education>({
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: ''
  });
  
  const [newExperience, setNewExperience] = useState<Experience>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // Image cropping states
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  
  // Input file references
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  // Handle photo file selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Handle resume file selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({
          ...prev,
          resumeUrl: reader.result as string,
          resumeName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  // Create cropped image
  const createCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      const imageObj = new Image();
      imageObj.src = image;
      
      await new Promise<void>((resolve) => {
        imageObj.onload = () => resolve();
      });
      
      // Set canvas dimensions to the cropped size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      // Draw the cropped image onto the canvas
      ctx.drawImage(
        imageObj,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      
      // Convert canvas to data URL
      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      
      // Update profile with new image
      setProfile(prev => ({
        ...prev,
        photoUrl: croppedImageUrl
      }));
      
      // Close cropper
      setShowCropper(false);
      setImage(null);
    } catch (e) {
      console.error('Error creating cropped image:', e);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle education input changes
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding new education
  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: ''
      });
    }
  };
  
  // Handle removing education
  const handleRemoveEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };
  
  // Handle experience input changes
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding new experience
  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      setProfile(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience]
      }));
      setNewExperience({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      });
    }
  };
  
  // Handle removing experience
  const handleRemoveExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically save the profile data to your backend
    console.log('Profile saved:', profile);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (dateString === 'present') return 'Present';
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">Professional Profile</h1>
      
      {isEditing ? (
        // Edit Mode
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6 border-b">
            <button
              type="button"
              onClick={() => setActiveSection('personal')}
              className={`px-4 py-2 font-medium ${activeSection === 'personal' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Personal Info
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('contact')}
              className={`px-4 py-2 font-medium ${activeSection === 'contact' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Contact Details
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('skills')}
              className={`px-4 py-2 font-medium ${activeSection === 'skills' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Skills & Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('education')}
              className={`px-4 py-2 font-medium ${activeSection === 'education' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Education
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('experience')}
              className={`px-4 py-2 font-medium ${activeSection === 'experience' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Experience
            </button>
          </div>
          
          {/* Personal Info Section */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-40 h-40 mb-4">
                  {profile.photoUrl ? (
                    <img 
                      src={profile.photoUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Photo
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                >
                  Upload Photo
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>
          )}
          
          {/* Contact Details Section */}
          {activeSection === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={profile.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={profile.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Skills & Resume Section */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                {profile.resumeUrl ? (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 truncate">{profile.resumeName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, resumeUrl: '', resumeName: '' }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                      Upload Resume
                    </button>
                    <p className="mt-1 text-sm text-gray-500">PDF, DOC, or DOCX up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={resumeInputRef}
                  onChange={handleResumeChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>
            </div>
          )}
          
          {/* Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Education History</h3>
              
              {profile.education.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{edu.institution}</p>
                      <p>{edu.degree} in {edu.field}</p>
                    </div>
                    <div className="text-right">
                      <p>{edu.startYear} - {edu.endYear || 'Present'}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={newEducation.institution}
                      onChange={handleEducationChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      id="degree"
                      name="degree"
                      value={newEducation.degree}
                      onChange={handleEducationChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="field" className="block text-sm font-medium text-gray-700">Field of Study</label>
                    <input
                      type="text"
                      id="field"
                      name="field"
                      value={newEducation.field}
                      onChange={handleEducationChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">Start Year</label>
                      <input
                        type="text"
                        id="startYear"
                        name="startYear"
                        value={newEducation.startYear}
                        onChange={handleEducationChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endYear" className="block text-sm font-medium text-gray-700">End Year</label>
                      <input
                        type="text"
                        id="endYear"
                        name="endYear"
                        value={newEducation.endYear}
                        onChange={handleEducationChange}
                        placeholder="or Present"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                >
                  Add Education
                </button>
              </div>
            </div>
          )}
          
          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
              
              {profile.experience.map((exp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                  <div>
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">{exp.position}</h4>
                      <p className="text-gray-600">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                    </div>
                    <p className="text-indigo-600">{exp.company}</p>
                    <p className="mt-2 text-gray-700">{exp.description}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Experience</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={newExperience.company}
                        onChange={handleExperienceChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={newExperience.position}
                        onChange={handleExperienceChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="month"
                        id="startDate"
                        name="startDate"
                        value={newExperience.startDate}
                        onChange={handleExperienceChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700"></label>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="month"
                        id="endDate"
                        name="endDate"
                        value={newExperience.endDate}
                        onChange={handleExperienceChange}
                        placeholder="Leave empty for present"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newExperience.description}
                      onChange={handleExperienceChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                >
                  Add Experience
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Save Profile
            </button>
          </div>
        </form>
      ) : (
        // View Mode
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg shadow-sm">
            <div className="w-40 h-40 mb-4 md:mb-0 md:mr-8">
              {profile.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-inner">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-indigo-600 text-lg mt-1">{profile.email}</p>
              <p className="mt-3 text-gray-600">{profile.bio}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-medium">{profile.address}</p>
                <p className="font-medium">{profile.city}, {profile.state} {profile.zipCode}</p>
                <p className="font-medium">{profile.country}</p>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">{profile.email}</p>
                </div>
                {profile.website && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 transition">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Skills and Resume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume
              </h3>
              {profile.resumeUrl ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="font-medium">{profile.resumeName}</p>
                      <a 
                        href={profile.resumeUrl} 
                        download={profile.resumeName} 
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No resume uploaded yet.</p>
              )}
            </div>
          </div>
          
          {/* Education */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              Education
            </h3>
            <div className="space-y-4">
              {profile.education.length > 0 ? (
                profile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-indigo-400 pl-4 py-1">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="col-span-2">
                        <h4 className="font-semibold text-gray-800">{edu.institution}</h4>
                        <p>{edu.degree} in {edu.field}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-600 font-medium">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No education history added yet.</p>
              )}
            </div>
          </div>
          
          {/* Experience */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Experience
            </h3>
            <div className="space-y-6">
              {profile.experience.length > 0 ? (
                profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-indigo-400 pl-4 py-1">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="col-span-2">
                        <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                        <p className="text-indigo-600">{exp.company}</p>
                        <p className="mt-2 text-gray-600">{exp.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-600 font-medium">
                          {formatDate(exp.startDate)} - {exp.endDate === 'present' ? 'Present' : formatDate(exp.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No work experience added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Image Cropper Modal */}
      {showCropper && image && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Crop Profile Picture</h3>
            
            <div className="relative h-64 mb-4 bg-gray-100 rounded">
              <EasyCrop
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCropper(false);
                  setImage(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;