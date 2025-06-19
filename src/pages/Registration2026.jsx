import React, { useState } from 'react';
import { ArrowRight, Plane, Users, Calendar, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Registration2026 = () => {
  const [formData, setFormData] = useState({
    // Parent/Guardian Information
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    // Young Eagle Information
    childName: '',
    childAge: '',
    childGrade: '',
    childDob: '',
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    // Program Preferences
    preferredMonth: '',
    sessionPreference: '',
    hasFlownBefore: '',
    interests: [],
    // Medical/Special Needs
    medicalConditions: '',
    specialNeeds: '',
    // Agreement
    agreedToTerms: false,
    agreedToWaiver: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const interests = [
    'Flying/Piloting',
    'Aircraft Mechanics',
    'Air Traffic Control',
    'Aerospace Engineering',
    'Military Aviation',
    'Commercial Aviation',
    'Flight Instruction',
    'Aviation Technology'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Registration data:', formData);
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for registering for the Young Eagles 2026 program. We'll contact you within 48 hours to confirm your spot and provide additional information.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll email you a confirmation with program details</li>
                <li>• You'll receive a welcome packet with forms and waivers</li>
                <li>• We'll contact you to schedule your child's flight</li>
                <li>• Orientation materials will be sent 2 weeks before the program</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-12 w-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Young Eagles 2026</h1>
          </div>
          <p className="text-blue-200 text-lg">Register Your Child for an Unforgettable Aviation Experience</p>
        </div>

        {/* Program Highlights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Program Highlights
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">30-45 Minute Flights</h3>
              <p className="text-blue-200 text-sm">Comprehensive aviation experience</p>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Year-Round Program</h3>
              <p className="text-blue-200 text-sm">Multiple sessions available</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">100% Free</h3>
              <p className="text-blue-200 text-sm">No cost to families</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Parent/Guardian Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Parent/Guardian Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Young Eagle Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Young Eagle Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Full Name *
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Child's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="childDob"
                    value={formData.childDob}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    required
                    min="8"
                    max="17"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Age (8-17)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Grade *
                  </label>
                  <input
                    type="text"
                    name="childGrade"
                    value={formData.childGrade}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8th Grade"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Aunt, Grandparent"
                  />
                </div>
              </div>
            </div>

            {/* Program Preferences */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Program Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Month
                  </label>
                  <select
                    name="preferredMonth"
                    value={formData.preferredMonth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Preference
                  </label>
                  <select
                    name="sessionPreference"
                    value={formData.sessionPreference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select preference</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Has your child flown in a small aircraft before?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasFlownBefore"
                      value="yes"
                      checked={formData.hasFlownBefore === 'yes'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasFlownBefore"
                      value="no"
                      checked={formData.hasFlownBefore === 'no'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aviation Interests (Check all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  {interests.map(interest => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="mr-2"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions or Allergies
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please list any medical conditions, allergies, or medications your child takes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Needs or Accommodations
                  </label>
                  <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe any special needs or accommodations required..."
                  />
                </div>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Agreement and Waiver</h3>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                    required
                    className="mr-3 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and 
                    understand that this is a free educational program for young people ages 8-17.
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreedToWaiver"
                    checked={formData.agreedToWaiver}
                    onChange={handleInputChange}
                    required
                    className="mr-3 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I acknowledge that flying involves inherent risks and agree to sign the official 
                    liability waiver before my child's flight. This registration is not a guarantee of 
                    flight participation.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreedToTerms || !formData.agreedToWaiver}
                className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                We'll contact you within 48 hours to confirm your registration
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration2026;

