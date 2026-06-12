import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaExclamationTriangle, FaParking, FaBus, FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = t('contact.form.nameRequired');
    } else if (form.name.length < 2) {
      newErrors.name = t('contact.form.nameLength');
    }

    if (!form.email.trim()) {
      newErrors.email = t('contact.form.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = t('contact.form.emailInvalid');
    }

    if (!form.message.trim()) {
      newErrors.message = t('contact.form.messageRequired');
    } else if (form.message.length < 10) {
      newErrors.message = t('contact.form.messageLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('contact.form.success'));
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    return `w-full px-4 py-2 rounded-lg border ${
      errors[fieldName] 
        ? 'border-red-500 dark:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200`;
  };

  return (
    <div className="max-w-4xl mx-auto p-8" role="main" id="main-content">
      <h1 className="text-4xl font-bold text-center mb-4 text-blue-700 dark:text-blue-300">{t('contact.title')}</h1>
      <p className="text-lg text-center mb-12 text-gray-600 dark:text-gray-300">{t('contact.subtitle')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaPhone className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Phone</h3>
                <p className="text-gray-600 dark:text-gray-300">(123) 456-7890</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaEnvelope className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">info@smilebright.com</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Emergency</h3>
                <p className="text-gray-600 dark:text-gray-300">(123) 555-1212</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaMapMarkerAlt className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Address</h3>
                <p className="text-gray-600 dark:text-gray-300">123 Smile Street, Dental City</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaClock className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Hours</h3>
                <p className="text-gray-600 dark:text-gray-300">Mon-Fri: 8am - 6pm</p>
                <p className="text-gray-600 dark:text-gray-300">Sat: 9am - 2pm</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaParking className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Parking</h3>
                <p className="text-gray-600 dark:text-gray-300">Free parking available on site</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaBus className="text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Public Transport</h3>
                <p className="text-gray-600 dark:text-gray-300">Bus stop: Smile St & Main Ave</p>
                <p className="text-gray-600 dark:text-gray-300">Lines 10, 22, 35</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="space-y-8">
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-blue-100 dark:border-gray-700 bg-white">
            <iframe
              title={t('contact.info.address')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.9537353153169!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f1f1f1f1%3A0x5045675218ce6e0!2s123%20Smile%20Street!5e0!3m2!1sen!2sau!4v1614036600000!5m2!1sen!2sau"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className="rounded-xl"
            ></iframe>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">{t('contact.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={getInputClassName('name')}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className={getInputClassName('message')}
                  rows={4}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                ></textarea>
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    {t('contact.form.sending')}
                  </span>
                ) : (
                  t('contact.form.send')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 