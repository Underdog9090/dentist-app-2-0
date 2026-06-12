import { Link } from 'react-router-dom';
import { FaTooth, FaCalendarAlt, FaUserMd, FaTeeth, FaTeethOpen } from 'react-icons/fa';
import Testimonials from '../components/Testimonials';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-800 px-6 py-12 md:py-20 rounded-b-3xl shadow-lg">
        <div className="flex-1 z-10 text-left md:pl-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">{t('home.heroTitle')}</h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-blue-700 dark:text-blue-300">{t('home.heroSubtitle')}</h2>
          <p className="text-lg md:text-xl mb-6 text-gray-700 dark:text-gray-200">{t('home.heroText')}</p>
              <Link
                to="/booking"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition duration-300"
              >
            {t('home.bookNow')}
              </Link>
            </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <img
            src="/images/dentist-hero.jpg"
            alt="Friendly dentist"
            className="w-72 h-72 object-cover rounded-2xl shadow-xl border-4 border-blue-100 dark:border-gray-700 bg-white"
            onError={(e) => { e.target.src = '/logo192.png'; }}
          />
        </div>
      </div>

      {/* Dental Services Preview */}
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t('home.dentalServices')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <FaTooth className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('services.whitening.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('services.whitening.description')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <FaTeeth className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('services.implants.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('services.implants.description')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <FaTeethOpen className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('services.braces.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('services.braces.description')}</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-blue-100 dark:bg-gray-800 mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">{t('home.whyChooseUs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg text-center">
              <FaUserMd className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('home.expertDentists.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.expertDentists.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg text-center">
              <FaTooth className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('home.modernTechnology.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.modernTechnology.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg text-center">
              <FaCalendarAlt className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('home.easyBooking.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.easyBooking.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}

export default Home; 