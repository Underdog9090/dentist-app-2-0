import { FaTooth, FaChild, FaUserAlt, FaBrush } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function DentalHealth() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300">{t('dentalHealth.title')}</h1>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaTooth className="text-3xl text-blue-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('dentalHealth.procedures.title')}</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-8">
          {(t('dentalHealth.procedures.items', { returnObjects: true }) || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaBrush className="text-3xl text-blue-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('dentalHealth.hygiene.title')}</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-8">
          {(t('dentalHealth.hygiene.items', { returnObjects: true }) || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaChild className="text-3xl text-blue-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('dentalHealth.children.title')}</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-8">
          {(t('dentalHealth.children.items', { returnObjects: true }) || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaUserAlt className="text-3xl text-blue-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('dentalHealth.seniors.title')}</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-8">
          {(t('dentalHealth.seniors.items', { returnObjects: true }) || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DentalHealth; 