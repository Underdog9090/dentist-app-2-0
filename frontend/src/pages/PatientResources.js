import React, { useState, useEffect } from 'react';
import { FaFileDownload, FaFileAlt, FaCreditCard, FaTooth, FaQuestionCircle, FaExclamationTriangle, FaSearch, FaHome, FaChevronRight, FaFilePdf, FaExternalLinkAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

const resources = [
  {
    id: 1,
    title: 'New Patient Forms',
    icon: <FaFileDownload className="text-4xl text-blue-600" />,
    description: 'Download and fill out our new patient forms before your first visit.',
    category: 'forms',
    image: '/images/clinic-placeholder.jpg',
    items: [
      {
        name: 'Patient Registration Form',
        link: '/resources/forms/registration.pdf',
        type: 'PDF',
        description: 'Complete this form to register as a new patient'
      },
      {
        name: 'Medical History Form',
        link: '/resources/forms/medical-history.pdf',
        type: 'PDF',
        description: 'Provide your medical history for better care'
      },
      {
        name: 'Insurance Information Form',
        link: '/resources/forms/insurance.pdf',
        type: 'PDF',
        description: 'Submit your insurance details'
      }
    ]
  },
  {
    id: 2,
    title: 'Insurance & Payment',
    icon: <FaCreditCard className="text-4xl text-blue-600" />,
    description: 'Information about accepted insurance plans and payment options.',
    category: 'insurance',
    image: '/images/insurance.jpg',
    items: [
      {
        name: 'Accepted Insurance Plans',
        link: '/resources/insurance/accepted-plans.pdf',
        type: 'PDF',
        description: 'View our list of accepted insurance providers'
      },
      {
        name: 'Payment Plans',
        link: '/resources/insurance/payment-plans.pdf',
        type: 'PDF',
        description: 'Learn about our flexible payment options'
      },
      {
        name: 'Financing Options',
        link: '/resources/insurance/financing.pdf',
        type: 'PDF',
        description: 'Explore financing solutions for your dental care'
      }
    ]
  },
  {
    id: 3,
    title: 'Dental Care Tips',
    icon: <FaTooth className="text-4xl text-blue-600" />,
    description: 'Helpful tips and guides for maintaining good oral health.',
    category: 'care',
    image: '/images/jonathan-borba-hl6uG9cHW5A-unsplash.jpg',
    items: [
      {
        name: 'Daily Oral Care Guide',
        link: '/resources/care/daily-guide.pdf',
        type: 'PDF',
        description: 'Learn the best practices for daily oral care'
      },
      {
        name: "Children's Dental Care",
        link: '/resources/care/children.pdf',
        type: 'PDF',
        description: "Special care tips for children's dental health"
      },
      {
        name: 'Senior Dental Care',
        link: '/resources/care/seniors.pdf',
        type: 'PDF',
        description: 'Dental care guidance for seniors'
      }
    ]
  },
  {
    id: 4,
    title: 'FAQ',
    icon: <FaQuestionCircle className="text-4xl text-blue-600" />,
    description: 'Frequently asked questions about our services and procedures.',
    category: 'faq',
    image: '/images/faq.jpg',
    items: [
      {
        name: 'General Questions',
        link: '/resources/faq/general.pdf',
        type: 'PDF',
        description: 'Common questions about our dental practice'
      },
      {
        name: 'Treatment Questions',
        link: '/resources/faq/treatments.pdf',
        type: 'PDF',
        description: 'Questions about specific dental treatments'
      },
      {
        name: 'Insurance Questions',
        link: '/resources/faq/insurance.pdf',
        type: 'PDF',
        description: 'Frequently asked insurance-related questions'
      }
    ]
  },
  {
    id: 5,
    title: 'Emergency Care',
    icon: <FaExclamationTriangle className="text-4xl text-blue-600" />,
    description: 'What to do in case of a dental emergency.',
    category: 'emergency',
    image: '/images/emergency.jpg',
    items: [
      {
        name: 'Emergency Contact Information',
        link: '/resources/emergency/contact.pdf',
        type: 'PDF',
        description: '24/7 emergency contact details'
      },
      {
        name: 'Common Emergencies',
        link: '/resources/emergency/common.pdf',
        type: 'PDF',
        description: 'How to handle common dental emergencies'
      },
      {
        name: 'After-Hours Care',
        link: '/resources/emergency/after-hours.pdf',
        type: 'PDF',
        description: 'Information about our after-hours emergency services'
      }
    ]
  }
];

function Feedback({ itemName }) {
  const { t } = useTranslation();
  const [voted, setVoted] = useState(() => {
    return localStorage.getItem(`resource-feedback-${itemName}`) || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (vote) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(`resource-feedback-${itemName}`, vote);
      setVoted(vote);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (voted) {
    return (
      <div className="mt-2 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
        <span role="img" aria-label="Thank you" className="text-xl">🙏</span>
        {t('patientResources.feedback.thankYou')}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2" aria-label="Resource feedback">
      <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">{t('patientResources.feedback.title')}</span>
      <button
        className={`p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Thumbs up"
        onClick={() => handleVote('up')}
        disabled={isSubmitting}
        type="button"
      >
        <span role="img" aria-label="Thumbs up" className="text-2xl">👍</span>
      </button>
      <button
        className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Thumbs down"
        onClick={() => handleVote('down')}
        disabled={isSubmitting}
        type="button"
      >
        <span role="img" aria-label="Thumbs down" className="text-2xl">👎</span>
      </button>
    </div>
  );
}

function ResourceCard({ resource, isExpanded, onToggle, onItemClick }) {
  const { t } = useTranslation();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500"
      role="article"
      aria-labelledby={`resource-title-${resource.id}`}
    >
      <div className="relative h-48 overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <img
          src={resource.image}
          alt={t(`patientResources.${resource.category}.title`)}
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          {resource.icon}
        </div>
        <h2 
          id={`resource-title-${resource.id}`}
          className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white"
        >
          {t(`patientResources.${resource.category}.title`)}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t(`patientResources.${resource.category}.description`)}
        </p>

        <button
          onClick={() => onToggle(resource.id)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-expanded={isExpanded}
          aria-controls={`resource-content-${resource.id}`}
        >
          {isExpanded ? t('patientResources.buttons.hideResources') : t('patientResources.buttons.viewResources')}
        </button>

        <div
          id={`resource-content-${resource.id}`}
          className={`mt-4 space-y-2 transition-all duration-300 ${
            isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          {resource.items.map((item, index) => (
            <div 
              key={index} 
              className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.link.endsWith('.pdf') && <FaFilePdf className="text-red-500 text-lg" title="PDF" />}
                  <span className="text-gray-800 dark:text-white font-medium">{item.name}</span>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <a
                    href={item.link.replace('.pdf', '.html')}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onItemClick(item)}
                  >
                    <FaExternalLinkAlt className="inline-block" />
                    {t('patientResources.buttons.viewOnline')}
                  </a>
                  {item.link.endsWith('.pdf') && (
                    <a
                      href={item.link}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => onItemClick(item)}
                    >
                      <FaDownload className="inline-block" />
                      {t('patientResources.buttons.downloadPDF')}
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">{item.description}</p>
              <Feedback itemName={item.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientResources() {
  const { t } = useTranslation();
  const [expandedResource, setExpandedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulate API call with React Query
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return resources;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter resources based on search query and category
  const filteredResources = resourcesData?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.items.some(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Track recently viewed items
  const handleItemClick = (item) => {
    setRecentlyViewed(prev => {
      const newList = [item, ...prev.filter(i => i.name !== item.name)].slice(0, 5);
      return newList;
    });
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setIsSearching(true);
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12" role="main" id="main-content">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link 
                to="/" 
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                <FaHome className="inline-block mr-2" />
                {t('patientResources.home')}
              </Link>
            </li>
            <li className="flex items-center">
              <FaChevronRight className="text-gray-400 mx-2" />
              <span className="text-gray-700 dark:text-gray-300">{t('patientResources.resources')}</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          {t('patientResources.title')}
        </h1>
        <p className="text-lg text-center mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('patientResources.subtitle')}
        </p>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('patientResources.search.placeholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search resources"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                {isSearching && (
                  <FaSpinner className="absolute right-3 top-3 text-blue-500 animate-spin" />
                )}
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by category"
            >
              <option value="all">{t('patientResources.categories.all')}</option>
              <option value="forms">{t('patientResources.categories.forms')}</option>
              <option value="insurance">{t('patientResources.categories.insurance')}</option>
              <option value="care">{t('patientResources.categories.care')}</option>
              <option value="faq">{t('patientResources.categories.faq')}</option>
              <option value="emergency">{t('patientResources.categories.emergency')}</option>
            </select>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('patientResources.recentlyViewed')}</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {recentlyViewed.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => handleItemClick(item)}
                >
                  <span className="text-gray-800 dark:text-white">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {t('patientResources.search.noResults')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isExpanded={expandedResource === resource.id}
                onToggle={(id) => setExpandedResource(expandedResource === id ? null : id)}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('patientResources.help.subtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('patientResources.buttons.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PatientResources; 