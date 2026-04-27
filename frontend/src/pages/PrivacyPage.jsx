import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 pb-20 space-y-8">
      <header className="pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground dark:text-white">Privacy Policy</h1>
        </div>
        <p className="text-slate-500 font-medium">Last updated: April 2026</p>
      </header>

      <div className="bg-card dark:bg-slate-800 p-8 md:p-12 rounded-[2rem] border border-border dark:border-slate-700 shadow-xl space-y-8 text-slate-600 dark:text-slate-300">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">1. Introduction</h2>
          <p>
            Welcome to Krisho ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our application, website, and related services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">2. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, or when you participate in activities on the app.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal Info:</strong> Name, phone number, email address, and shipping/billing addresses.</li>
            <li><strong>Credentials:</strong> Passwords and security information used for authentication.</li>
            <li><strong>Location Data:</strong> To match farmers with local buyers, we collect city and state information.</li>
            <li><strong>Voice Data:</strong> Audio recordings are temporarily processed for our Voice Search functionality but are not permanently stored.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">3. How We Use Your Information</h2>
          <p>We use personal information collected via our app for a variety of business purposes described below:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To fulfill and manage your orders, payments, and exchanges.</li>
            <li>To communicate with you regarding order updates and app features.</li>
            <li>To protect our Services from fraud or unauthorized access.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">4. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our App is at your own risk.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
