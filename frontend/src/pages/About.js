import { FaRegSmile, FaUserMd, FaTooth, FaAward, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Mission & History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 mb-8 text-center">
        <FaRegSmile className="text-4xl text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-300">{t('about.title')}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-4">
          {t('about.mission')}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('about.history')}
        </p>
      </div>

      {/* Facility & Technology */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-center">
        <img
         src="/images/modern.jpg"
          alt={t('about.facilityImageAlt')}
          className="w-full md:w-1/2 h-64 object-cover rounded-xl shadow border-2 border-blue-100 dark:border-gray-700 bg-white mb-4 md:mb-0"
          onError={(e) => { e.target.src = '/logo192.png'; }}
        />
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <FaTooth className="text-3xl text-blue-500 mb-2" />
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('about.facility.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t('about.facility.description')}
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 mb-8">
        <FaUserMd className="text-3xl text-blue-500 mb-2" />
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('about.team.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <img
              src="/images/drsara.jpg"
              alt={t('about.team.dentist1Alt')}
              className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            />
            <h4 className="font-semibold text-gray-800 dark:text-white">Dr. Sarah Johnson</h4>
            <p className="text-gray-600 dark:text-gray-300">{t('about.team.dentist1Role')}</p>
          </div>
          <div className="text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <img
              src="/images/michael.jpg"
              alt={t('about.team.dentist2Alt')}
              className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            />
            <h4 className="font-semibold text-gray-800 dark:text-white">Dr. Michael Chen</h4>
            <p className="text-gray-600 dark:text-gray-300">{t('about.team.dentist2Role')}</p>
          </div>
        </div>
      </div>

      {/* Certifications & Accreditations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
        <FaAward className="text-3xl text-blue-500 mb-2" />
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('about.certifications.title')}</h3>
          <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside">
            {t('about.certifications.list', { returnObjects: true }).map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Location & Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex items-center gap-4">
        <FaMapMarkerAlt className="text-3xl text-blue-500" />
        <div>
          <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">{t('about.location.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('about.location.address')}</p>
          <div className="mt-4">
            <img
              src="/images/location.jpg"
              alt={t('about.location.mapAlt')}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 