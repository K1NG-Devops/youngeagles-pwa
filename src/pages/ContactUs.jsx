import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, MessageSquare, Calendar, Users, Plane } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: '',
    message: '',
    preferredContact: 'email',
    isUrgent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const inquiryTypes = [
    'General Information',
    '2026 Program Registration',
    'Volunteer Opportunities',
    'Scheduling & Availability',
    'Safety & Requirements',
    'Group/Organization Visits',
    'Media & Press Inquiries',
    'Partnership Opportunities',
    'Other'
  ];

  const subjects = [
    'Young Eagles Program Information',
    'Registration Questions',
    'Flight Scheduling',
    'Volunteer Application',
    'Safety Concerns',
    'Group Visit Request',
    'Partnership Inquiry',
    'Media Request',
    'General Question'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Contact form data:', formData);
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Contact form error:', error);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will respond within 24 hours during business days.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll review your inquiry and respond promptly</li>
                <li>• For urgent matters, we'll contact you by phone</li>
                <li>• Check your email for our response</li>
                <li>• Feel free to contact us directly at (555) 123-EAGLE</li>
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
      <div className="max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          </div>
          <p className="text-blue-200 text-lg">Have questions about the Young Eagles program? We're here to help!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contact Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Phone</p>
                    <p className="text-blue-200">(555) 123-EAGLE</p>
                    <p className="text-blue-200 text-sm">Mon-Fri: 9 AM - 5 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Email</p>
                    <p className="text-blue-200">info@youngeagles.org</p>
                    <p className="text-blue-200 text-sm">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Location</p>
                    <p className="text-blue-200">Regional Airport</p>
                    <p className="text-blue-200">Hangar 12, Aviation Way</p>
                    <p className="text-blue-200">Your City, ST 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Flight Days</p>
                    <p className="text-blue-200">Saturdays: 9 AM - 4 PM</p>
                    <p className="text-blue-200">Sundays: 10 AM - 3 PM</p>
                    <p className="text-blue-200 text-sm">Weather permitting</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/register-2026'}
                  className="w-full bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Register for 2026
                </button>
                <button 
                  onClick={() => window.location.href = '/volunteer'}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Volunteer With Us
                </button>
                <button 
                  onClick={() => window.location.href = '/about'}
                  className="w-full bg-white/20 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <Plane className="h-5 w-5 mr-2" />
                  Learn More
                </button>
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Common Questions</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-yellow-400 font-semibold">Is the program really free?</p>
                  <p className="text-blue-200">Yes! 100% free for all participants.</p>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold">What ages can participate?</p>
                  <p className="text-blue-200">Ages 8-17 are eligible to fly.</p>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold">How long is the flight?</p>
                  <p className="text-blue-200">Typically 30-45 minutes in the air.</p>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold">What should we bring?</p>
                  <p className="text-blue-200">Just excitement! We provide everything else.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="either">Either</option>
                    </select>
                  </div>
                </div>

                {/* Inquiry Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select inquiry type</option>
                      {inquiryTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide details about your inquiry, including any specific questions or requirements..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 10 characters. Be specific to help us provide the best response.
                  </p>
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      This is urgent (response needed within 24 hours)
                    </label>
                    <p className="text-xs text-gray-500">
                      Check this box if your inquiry requires immediate attention
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    We typically respond within 24 hours during business days
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Calendar className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Program Schedule</h3>
            <p className="text-blue-200">
              Flights available year-round on weekends. Special events throughout the year.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Safety First</h3>
            <p className="text-blue-200">
              All flights conducted by certified pilots with extensive safety training and equipment.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Plane className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Educational Mission</h3>
            <p className="text-blue-200">
              Inspiring the next generation of aviators through hands-on flight experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

