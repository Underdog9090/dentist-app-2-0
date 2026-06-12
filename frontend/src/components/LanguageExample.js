import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageExample = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-example">
      <h2>{t('home.heroTitle')}</h2>
      <p>{t('about.mission')}</p>
      
      {/* Example of using translation with variables */}
      <p>{t('contact.thankYou')}</p>

      {/* Language switcher buttons */}
      <div className="language-buttons">
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('sv')}>Svenska</button>
      </div>

      {/* Example of nested translations */}
      <nav>
        <ul>
          <li>{t('nav.home')}</li>
          <li>{t('nav.about')}</li>
          <li>{t('nav.contact')}</li>
        </ul>
      </nav>
    </div>
  );
};

export default LanguageExample; 