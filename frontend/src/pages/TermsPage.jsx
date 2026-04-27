import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 pb-20 space-y-8">
      <header className="pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground dark:text-white">Terms of Service</h1>
        </div>
        <p className="text-slate-500 font-medium">Effective Date: April 2026</p>
      </header>

      <div className="bg-card dark:bg-slate-800 p-8 md:p-12 rounded-[2rem] border border-border dark:border-slate-700 shadow-xl space-y-8 text-slate-600 dark:text-slate-300">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Krisho marketplace, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">2. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate, complete, and current information when creating an account.</li>
            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
            <li>Suppliers (Farmers) must ensure that all product listings accurately represent the actual physical goods being sold.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">3. Marketplace Rules</h2>
          <p>Krisho acts as a facilitator between farmers and consumers. We expect all users to engage in fair trading practices.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Selling illegal or regulated items is strictly prohibited.</li>
            <li>Prices must be clearly stated in INR (₹).</li>
            <li>Quality disputes should be handled directly between the buyer and seller, though Krisho may intervene in cases of suspected fraud.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground dark:text-white">4. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
