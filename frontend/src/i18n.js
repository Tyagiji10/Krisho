import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome to Krisho",
          tagline: "Bharat's Direct Farm-to-Table Marketplace",
          marketplace: "Digital Mandi",
          dashboard: "Dashboard",
          overview: "Overview",
          products: "My Products",
          customers: "Customers",
          payments: "Payment Details",
          cart: "Cart",
          orders: "My Orders",
          profile: "Profile",
          login: "Login",
          join: "Join Krisho",
          search_placeholder: "Search grains, vegetables, fruits...",
          categories: {
            all: "All Items",
            grains: "Grains",
            vegetables: "Vegetables",
            fruits: "Fruits",
            dairy: "Dairy",
            organic: "Organic",
            spices: "Spices"
          },
          purchased_by: "Purchased by {{count}} users",
          add_to_cart: "Add to Cart",
          only_left: "Only {{count}} left",
          total_earnings: "Total Earnings",
          active_orders: "Active Orders",
          active_listings: "Active Listings"
        }
      },
      hi: {
        translation: {
          welcome: "कृषो में आपका स्वागत है",
          tagline: "भारत का सीधा खेत-से-मेज बाजार",
          marketplace: "डिजिटल मंडी",
          dashboard: "डैशबोर्ड",
          overview: "अवलोकन",
          products: "मेरे उत्पाद",
          customers: "ग्राहक",
          payments: "भुगतान विवरण",
          cart: "कार्ट",
          orders: "मेरे ऑर्डर",
          profile: "प्रोफ़ाइल",
          login: "लॉगिन",
          join: "कृषो से जुड़ें",
          search_placeholder: "अनाज, सब्जियां, फल खोजें...",
          categories: {
            all: "सभी आइटम",
            grains: "अनाज",
            vegetables: "सब्जियां",
            fruits: "फल",
            dairy: "डेयरी",
            organic: "जैविक",
            spices: "मसाले"
          },
          purchased_by: "{{count}} उपयोगकर्ताओं द्वारा खरीदा गया",
          add_to_cart: "कार्ट में जोड़ें",
          only_left: "केवल {{count}} बचे हैं",
          total_earnings: "कुल कमाई",
          active_orders: "सक्रिय ऑर्डर",
          active_listings: "सक्रिय लिस्टिंग"
        }
      },
      mr: {
        translation: {
          welcome: "कृषो मध्ये आपले स्वागत आहे",
          tagline: "भारताचा थेट शेत-ते-टेबल बाजार",
          marketplace: "डिजिटल मंडी",
          dashboard: "डॅशबोर्ड",
          overview: "आढावा",
          products: "माझे उत्पादने",
          customers: "ग्राहक",
          payments: "पेमेंट तपशील",
          cart: "कार्ट",
          orders: "माझे ऑर्डर",
          profile: "प्रोफाइल",
          login: "लॉगिन",
          join: "कृषो मध्ये सामील व्हा",
          search_placeholder: "धान्य, भाज्या, फळे शोधा...",
          categories: {
            all: "सर्व आयटम",
            grains: "धान्य",
            vegetables: "भाज्या",
            fruits: "फळे",
            dairy: "दुग्धजन्य",
            organic: "सेंद्रिय",
            spices: "मसाले"
          },
          purchased_by: "{{count}} वापरकर्त्यांनी खरेदी केले",
          add_to_cart: "कार्टमध्ये जोडा",
          only_left: "फक्त {{count}} शिल्लक",
          total_earnings: "एकूण कमाई",
          active_orders: "सक्रिय ऑर्डर",
          active_listings: "सक्रिय लिस्टिंग"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
