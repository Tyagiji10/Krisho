import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft } from 'lucide-react';

const CookiesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 pb-20 space-y-8">
      <header className="pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Cookie size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground dark:text-white">Cookie Policy</h1>
        </div>
        <p className="text-slate-500 font-medium">Effective Date: April 2026</p>
      </header>

      <div className="bg-card dark:bg-slate-800 p-8 md:p-12 rounded-[2rem] border border-border dark:border-slate-700 shadow-xl space-y-8 text-slate-600 dark:text-slate-300">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website or use an app. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">2. How We Use Local Data</h2>
          <p>Krisho uses browser Local Storage and minimal cookies to enhance your experience:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Authentication:</strong> We store a secure token in your browser to keep you logged in so you don't have to enter your credentials every time you visit.</li>
            <li><strong>Preferences:</strong> We save your UI choices, such as Dark Mode settings and preferred language (Hindi, Marathi, or English).</li>
            <li><strong>Cart Data:</strong> Your shopping cart items are saved locally so you don't lose them if you refresh the page or close the browser.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">3. Third-Party Services</h2>
          <p>
            We may use third-party service providers, such as analytics tools, which may also place cookies on your device to help us understand how you use Krisho and how we can improve it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">4. Managing Your Preferences</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting or amending your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiesPage;
