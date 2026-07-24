import { useEffect } from 'react';

let widgetInitialized = false;

const GoogleTranslate = () => {
  useEffect(() => {
    if (widgetInitialized) return;

    const initWidget = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' },
          'google_translate_element'
        );
        widgetInitialized = true;
      }
    };

    window.googleTranslateElementInit = initWidget;

    const existingScript = document.getElementById('google-translate-script');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => console.error('Google Translate script failed to load');
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      window.googleTranslateElementInit = null;
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      className="mt-2 sm:mt-0 ml-0 sm:ml-4 rounded-md px-2 py-1 text-xs sm:text-sm shadow-md min-w-[110px]"
    />
  );
};

export default GoogleTranslate;