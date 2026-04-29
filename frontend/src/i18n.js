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
          active_listings: "Active Listings",
          voice_guides: {
            welcome_supplier: "Welcome to your Supplier Command Center. You can view your gross earnings, manage your Mandi products, check incoming orders, and see customer reviews from the quick action buttons below.",
            welcome_consumer: "Welcome to the Krisho Home Page. Browse fresh produce from local farmers, check your order history, or visit the Digital Mandi to shop.",
            welcome_guest: "Welcome to Krisho. Direct from Farm to your Home. Please sign up or log in to get started.",
            login: "Login Page. Enter your email and password to sign in. You can also use Google sign-in for quick access.",
            register: "Registration Page. Enter your name, email, password, and select your role as Consumer or Supplier to create your account.",
            mandi: "Digital Mandi. Browse fresh produce from local farmers. Use the category filter at the top to find specific items, or use the search bar to find products by name.",
            cart: "Shopping Cart. Review items you have added. Adjust quantities using plus and minus buttons. Click Proceed to Secure Checkout when you are ready to place your order.",
            manage_mandi: "Manage Mandi. Here you can add new products, edit pricing, update stock levels, or remove items from your store.",
            incoming_orders: "Incoming Orders. View all customer orders, mark them as completed, and manage delivery status.",
            dashboard: "Supplier Dashboard. View your gross earnings, net profit breakdown, manage products, track orders, and read customer reviews from the sidebar tabs.",
            orders: "Order History. Track your current and past orders. Click on any order to see full details including items, delivery address, and payment status.",
            profile: "Profile Settings. Update your name, phone number, city, state, and profile photo. You can also change your password and manage your account preferences here."
          },
          nav_guides: {
            home_supplier: "Home Page. View your supplier command center with earnings, products and quick actions.",
            home_consumer: "Home Page. Browse categories, view featured products, and explore the marketplace.",
            mandi: "Manage Mandi. Add, edit, or remove products from your store. Update pricing and stock levels.",
            orders: "Order History. Track the status of your current and past orders.",
            ai: "Opening AI assistant",
            incoming: "Incoming Orders. View all customer orders, mark them as completed, and manage delivery status.",
            cart: "Shopping Cart. Review your selected items, adjust quantities, and proceed to checkout.",
            profile: "Profile Settings. Update your name, location, profile photo, and account preferences."
          },
          dashboard_guides: {
            overview: "This is your Dashboard Overview. Here you can see your gross earnings, net profit after 8 percent platform commission, total active orders, and product count at a glance.",
            products: "This is your Mandi Management section. You can add new products, edit existing ones, update stock and pricing, or remove items from your store.",
            orders: "This is your Incoming Orders section. You can view all customer orders, mark them as completed or delivered, and track order status.",
            reviews: "This is your Customer Reviews section. Here you can read feedback and star ratings from your customers to improve your service.",
            customers: "This is your Customers section. You can see who has purchased from your store and their order history.",
            payments: "This is your Payment Settings. Update your UPI ID, bank account details, and IFSC code to receive payouts from the platform."
          },
          portal_guides: {
            overview: "Analytics View. Here you can see your gross earnings, weekly revenue chart, and top performing products at a glance.",
            products: "Manage Mandi. Add new products, edit pricing, update stock levels, or remove items from your store.",
            orders: "Incoming Orders. View all customer orders, mark them as completed, or track delivery status.",
            payments: "Payout Settings. Update your UPI ID, bank account number, and IFSC code to receive your earnings.",
            reviews: "Customer Reviews. Read feedback and star ratings from your buyers to improve your service quality."
          }
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
          active_listings: "सक्रिय लिस्टिंग",
          voice_guides: {
            welcome_supplier: "आपके सप्लायर कमांड सेंटर में आपका स्वागत है। आप नीचे दिए गए क्विक एक्शन बटनों से अपनी कुल कमाई देख सकते हैं, अपने मंडी उत्पादों को मैनेज कर सकते हैं, आने वाले ऑर्डर देख सकते हैं और ग्राहकों के रिव्यू पढ़ सकते हैं।",
            welcome_consumer: "कृषो होम पेज पर आपका स्वागत है। ताजी उपज देखें, अपना ऑर्डर इतिहास चेक करें, या खरीदारी के लिए डिजिटल मंडी पर जाएं।",
            welcome_guest: "कृषो में आपका स्वागत है। सीधे खेत से आपके घर तक। शुरू करने के लिए कृपया साइन अप या लॉग इन करें।",
            login: "लॉगिन पेज। साइन इन करने के लिए अपना ईमेल और पासवर्ड डालें। आप त्वरित पहुंच के लिए गूगल साइन-इन का भी उपयोग कर सकते हैं।",
            register: "रजिस्ट्रेशन पेज। अपना नाम, ईमेल, पासवर्ड डालें और अपना खाता बनाने के लिए कंज्यूमर या सप्लायर के रूप में अपनी भूमिका चुनें।",
            mandi: "डिजिटल मंडी। ताजी उपज ब्राउज़ करें। विशिष्ट आइटम खोजने के लिए श्रेणी फ़िल्टर का उपयोग करें, या सर्च बार का उपयोग करें।",
            cart: "शॉपिंग कार्ट। अपने आइटम की समीक्षा करें। मात्रा समायोजित करें। जब आप ऑर्डर देने के लिए तैयार हों तो प्रोसीड टू चेकआउट पर क्लिक करें।",
            manage_mandi: "मंडी प्रबंधन। यहां आप नए उत्पाद जोड़ सकते हैं, मूल्य निर्धारण संपादित कर सकते हैं, स्टॉक स्तर अपडेट कर सकते हैं, या आइटम हटा सकते हैं।",
            incoming_orders: "आने वाले ऑर्डर। ग्राहकों के सभी ऑर्डर देखें, उन्हें पूरा हुआ चिह्नित करें, और डिलीवरी प्रबंधित करें।",
            dashboard: "सप्लायर डैशबोर्ड। साइडबार टैब से अपनी कुल कमाई, लाभ विवरण, उत्पाद प्रबंधन, ऑर्डर ट्रैक करें और रिव्यू देखें।",
            orders: "ऑर्डर इतिहास। अपने वर्तमान और पिछले ऑर्डर ट्रैक करें। पूरी जानकारी देखने के लिए किसी भी ऑर्डर पर क्लिक करें।",
            profile: "प्रोफ़ाइल सेटिंग्स। अपना नाम, फ़ोन नंबर, शहर, राज्य और फ़ोटो अपडेट करें। आप यहां अपना पासवर्ड भी बदल सकते हैं।"
          },
          nav_guides: {
            home_supplier: "होम पेज। कमाई, उत्पादों और त्वरित कार्यों के साथ अपना सप्लायर कमांड सेंटर देखें।",
            home_consumer: "होम पेज। श्रेणियां ब्राउज़ करें, विशेष उत्पाद देखें और बाजार का पता लगाएं।",
            mandi: "मंडी प्रबंधन। अपनी दुकान से उत्पाद जोड़ें, संपादित करें या हटाएं। मूल्य निर्धारण और स्टॉक स्तर अपडेट करें।",
            orders: "ऑर्डर इतिहास। अपने वर्तमान और पिछले ऑर्डर की स्थिति ट्रैक करें।",
            ai: "एआई सहायक खोल रहा है",
            incoming: "आने वाले ऑर्डर। ग्राहकों के सभी ऑर्डर देखें, उन्हें पूरा हुआ चिह्नित करें और डिलीवरी की स्थिति प्रबंधित करें।",
            cart: "शॉपिंग कार्ट। अपने चयनित आइटम की समीक्षा करें, मात्रा समायोजित करें और चेकआउट के लिए आगे बढ़ें।",
            profile: "प्रोफ़ाइल सेटिंग्स। अपना नाम, स्थान, प्रोफ़ाइल फ़ोटो और खाता प्राथमिकताएं अपडेट करें।"
          },
          dashboard_guides: {
            overview: "यह आपका डैशबोर्ड ओवरव्यू है। यहां आप अपनी कुल कमाई, लाभ, सक्रिय ऑर्डर और उत्पादों की संख्या देख सकते हैं।",
            products: "यह आपका मंडी प्रबंधन अनुभाग है। आप नए उत्पाद जोड़ सकते हैं, मौजूदा उत्पादों को संपादित कर सकते हैं या स्टॉक अपडेट कर सकते हैं।",
            orders: "यह आपका आने वाले ऑर्डर अनुभाग है। आप ग्राहकों के ऑर्डर देख सकते हैं और उन्हें पूर्ण चिह्नित कर सकते हैं।",
            reviews: "यह आपका ग्राहक समीक्षा अनुभाग है। यहां आप अपने ग्राहकों से फीडबैक और रेटिंग पढ़ सकते हैं।",
            customers: "यह आपका ग्राहक अनुभाग है। आप देख सकते हैं कि आपकी दुकान से किसने खरीदारी की है।",
            payments: "यह आपकी भुगतान सेटिंग्स है। भुगतान प्राप्त करने के लिए अपना बैंक विवरण अपडेट करें।"
          },
          portal_guides: {
            overview: "एनालिटिक्स व्यू। यहां आप अपनी कुल कमाई, साप्ताहिक राजस्व चार्ट और शीर्ष प्रदर्शन करने वाले उत्पाद देख सकते हैं।",
            products: "मंडी प्रबंधन। नए उत्पाद जोड़ें, मूल्य निर्धारण संपादित करें, स्टॉक स्तर अपडेट करें, या अपनी दुकान से आइटम हटाएं।",
            orders: "आने वाले ऑर्डर। ग्राहकों के सभी ऑर्डर देखें, उन्हें पूरा हुआ चिह्नित करें, या डिलीवरी की स्थिति ट्रैक करें।",
            payments: "पेआउट सेटिंग्स। अपनी कमाई प्राप्त करने के लिए अपनी यूपीआई आईडी, बैंक खाता संख्या और आईएफएससी कोड अपडेट करें।",
            reviews: "ग्राहक समीक्षा। अपनी सेवा की गुणवत्ता में सुधार के लिए अपने खरीदारों से फीडबैक और स्टार रेटिंग पढ़ें।"
          }
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
      },
      te: {
        translation: {
          welcome: "కృషో కి స్వాగతం",
          tagline: "భారతదేశపు ప్రత్యక్ష వ్యవసాయ-నుండి-టేబుల్ మార్కెట్",
          marketplace: "డిజిటల్ మండి",
          dashboard: "డ్యాష్‌బోర్డ్",
          overview: "అవలోకనం",
          products: "నా ఉత్పత్తులు",
          customers: "కస్టమర్లు",
          payments: "చెల్లింపు వివరాలు",
          cart: "కార్ట్",
          orders: "నా ఆర్డర్లు",
          profile: "ప్రొఫైల్",
          login: "లాగిన్",
          join: "కృషో లో చేరండి",
          search_placeholder: "ధాన్యాలు, కూరగాయలు, పండ్లు వెతకండి...",
          categories: {
            all: "అన్ని వస్తువులు",
            grains: "ధాన్యాలు",
            vegetables: "కూరగాయలు",
            fruits: "పండ్లు",
            dairy: "పాల ఉత్పత్తులు",
            organic: "ఆర్గానిక్",
            spices: "మసాలాలు"
          },
          purchased_by: "{{count}} మంది వినియోగదారులు కొనుగోలు చేశారు",
          add_to_cart: "కార్ట్ కి జోడించండి",
          only_left: "కేవలం {{count}} మాత్రమే మిగిలి ఉన్నాయి",
          total_earnings: "మొత్తం ఆదాయం",
          active_orders: "యాక్టివ్ ఆర్డర్లు",
          active_listings: "యాక్టివ్ లిస్టింగ్‌లు"
        }
      },
      pa: {
        translation: {
          welcome: "ਕ੍ਰਿਸ਼ੋ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
          tagline: "ਭਾਰਤ ਦੀ ਸਿੱਧੀ ਫਾਰਮ-ਟੂ-ਟੇਬਲ ਮਾਰਕੀਟ",
          marketplace: "ਡਿਜੀਟਲ ਮੰਡੀ",
          dashboard: "ਡੈਸ਼ਬੋਰਡ",
          overview: "ਸੰਖੇਪ",
          products: "ਮੇਰੇ ਉਤਪਾਦ",
          customers: "ਗਾਹਕ",
          payments: "ਭੁਗਤਾਨ ਦੇ ਵੇਰਵੇ",
          cart: "ਕਾਰਟ",
          orders: "ਮੇਰੇ ਆਰਡਰ",
          profile: "ਪ੍ਰਫਾਈਲ",
          login: "ਲੌਗਇਨ",
          join: "ਕ੍ਰਿਸ਼ੋ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
          search_placeholder: "ਅਨਾਜ, ਸਬਜ਼ੀਆਂ, ਫਲ ਲੱਭੋ...",
          categories: {
            all: "ਸਾਰੀਆਂ ਚੀਜ਼ਾਂ",
            grains: "ਅਨਾਜ",
            vegetables: "ਸਬਜ਼ੀਆਂ",
            fruits: "ਫਲ",
            dairy: "ਡੇਅਰੀ",
            organic: "ਜੈਵਿਕ",
            spices: "ਮਸਾਲੇ"
          },
          purchased_by: "{{count}} ਉਪਭੋਗਤਾਵਾਂ ਦੁਆਰਾ ਖਰੀਦਿਆ ਗਿਆ",
          add_to_cart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
          only_left: "ਸਿਰਫ {{count}} ਬਾਕੀ",
          total_earnings: "ਕੁੱਲ ਕਮਾਈ",
          active_orders: "ਸਰਗਰਮ ਆਰਡਰ",
          active_listings: "ਸਰਗਰਮ ਸੂਚੀਆਂ"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
