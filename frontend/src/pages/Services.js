import React, { useState } from 'react';
import { FaTooth, FaClock, FaDollarSign, FaQuestionCircle, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Services() {
  const { t } = useTranslation();
  const [expandedService, setExpandedService] = useState(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(null);

  const services = [
    {
      id: 1,
      key: 'cleaning',
      icon: <FaTooth className="text-4xl text-blue-600" />,
      beforeImage: '/images/dirty.jpg',
      afterImage: '/images/clean.jpg',
    },
    {
      id: 2,
      key: 'braces',
      icon: <FaTooth className="text-4xl text-blue-600" />,
      beforeImage: '/images/crack.webp',
      afterImage: '/images/braces.jpg',
    },
    {
      id: 3,
      key: 'whitening',
      icon: <FaTooth className="text-4xl text-blue-600" />,
      beforeImage: '/images/jonathan-borba-hl6uG9cHW5A-unsplash.jpg',
      afterImage: '/images/whitening.jpg',
    },
    {
      id: 4,
      key: 'implants',
      icon: <FaTooth className="text-4xl text-blue-600" />,
      beforeImage: '/images/implants.jpg',
      afterImage: '/images/smily.jpg',
    },
    {
      id: 5,
      key: 'emergency',
      icon: <FaTooth className="text-4xl text-blue-600" />,
      beforeImage: '/images/clinic-placeholder.jpg',
      afterImage: '/images/beforee.jpg',
    },
  ];

  const toggleService = (id) => {
    setExpandedService(expandedService === id ? null : id);
    setShowBeforeAfter(null);
  };

  const toggleBeforeAfter = (id) => {
    setShowBeforeAfter(showBeforeAfter === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          {t('services.title')}
        </h1>
        <p className="text-lg text-center mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('services.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-105 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  {service.icon}
                </div>
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                  {t(`services.${service.key}.title`)}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t(`services.${service.key}.description`)}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaClock className="mr-2" />
                    <span>{t(`services.${service.key}.duration`)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaDollarSign className="mr-2" />
                    <span>{t(`services.${service.key}.priceRange`)}</span>
                  </div>
                </div>
                {/* Before/After Images */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleBeforeAfter(service.id)}
                    className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showBeforeAfter === service.id ? t('services.hideBeforeAfter') : t('services.showBeforeAfter')}
                  </button>
                  {showBeforeAfter === service.id && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('services.before')}</p>
                        <img
                          src={service.beforeImage}
                          alt={`Before ${t(`services.${service.key}.title`)}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('services.after')}</p>
                        <img
                          src={service.afterImage}
                          alt={`After ${t(`services.${service.key}.title`)}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Book Now Button */}
                <Link
                  to="/booking"
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mb-4"
                >
                  <FaCalendarAlt className="mr-2" />
                  {t('services.bookNow')}
                </Link>
                <button
                  onClick={() => toggleService(service.id)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaQuestionCircle className="mr-2" />
                  {expandedService === service.id ? t('services.hideDetails') : t('services.showDetails')}
                </button>
                {expandedService === service.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{t('services.benefits')}:</h3>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                        {(t(`services.${service.key}.benefits`, { returnObjects: true }) || []).map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{t('services.faq')}:</h3>
                      <div className="space-y-2">
                        {Object.values(t(`services.${service.key}.faq`, { returnObjects: true }) || {}).map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <p className="font-medium text-gray-800 dark:text-white">{item.question}</p>
                            <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('services.notFound')}
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {t('services.contactUs')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Services; 