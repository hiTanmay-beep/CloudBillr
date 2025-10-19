'use client';

import { useState, ReactNode } from 'react';

interface AccordionItemProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem = ({ title, children, isOpen, onClick }: AccordionItemProps) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left py-5 px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none transition-colors"
        >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
            <div className="px-6 pb-5 text-gray-600 dark:text-gray-300">
                {children}
            </div>
        </div>
    </div>
);

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(false);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError('Please fill out all required fields.');
            setLoading(false);
            return;
        }

        console.log("Form Submitted:", formData);
        setLoading(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    const faqItems = [
        {
            q: "Is CloudBillr GST compliant?",
            a: "Yes, absolutely. CloudBillr is 100% compliant with Indian GST regulations. You can easily add GST details, HSN codes, and generate tax-compliant invoices."
        },
        {
            q: "Can I use CloudBillr on my mobile?",
            a: "Yes, CloudBillr is a cloud-based platform designed to be fully responsive. You can create, manage, and send invoices from any device, including your smartphone, tablet, or desktop."
        },
        {
            q: "What kind of businesses is this for?",
            a: "CloudBillr is designed for a wide range of Indian businesses, including wholesalers, retailers, freelancers, and service providers. Its flexible features adapt to various billing needs."
        },
        {
            q: "Is my data secure?",
            a: "Security is our top priority. Your data is stored securely with regular backups to ensure it's always safe and accessible to you."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
            {/* Hero Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">Get In Touch</h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16 sm:py-20 flex-grow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
                        {submitted && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg animate-pulse">
                                <p className="text-green-800 dark:text-green-200 font-medium">✅ Thank you! Your message has been sent successfully.</p>
                            </div>
                        )}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
                                <p className="text-red-800 dark:text-red-200 font-medium">❌ {error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                                    <input 
                                        id="name" 
                                        name="name" 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" 
                                        placeholder="Your Name" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                                    <input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" 
                                        placeholder="your@email.com" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number (Optional)</label>
                                <input 
                                    id="phone" 
                                    name="phone" 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" 
                                    placeholder="+91 123 456 7890" 
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                                <input 
                                    id="subject" 
                                    name="subject" 
                                    type="text" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" 
                                    placeholder="How can we help?" 
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    rows={6} 
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition resize-none" 
                                    placeholder="Your message..." 
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Find answers to common questions about CloudBillr</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={index}
                                title={item.q}
                                isOpen={openFaq === index}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <p className="text-sm sm:text-base leading-relaxed">{item.a}</p>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer with Contact Info */}
            <footer className="bg-gradient-to-r from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 place-items-center md:place-items-start justify-center md:justify-end">
                        {/* Brand Section */}
                        <div>
                            <h3 className="text-2xl font-bold mb-2">CloudBillr</h3>
                            <p className="text-blue-100">Your trusted billing solution for Indian businesses</p>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 pt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1">Phone</p>
                                        <a href="tel:+918126545331" className="hover:text-blue-200 transition font-medium">+91 8126545331</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 pt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1">Email</p>
                                        <a href="mailto:khandelwaltanmay352@gmail.com" className="hover:text-blue-200 transition font-medium break-all">khandelwaltanmay352@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="/" className="text-blue-100 hover:text-blue-200 transition">Home</a></li>
                                <li><a href="/about" className="text-blue-100 hover:text-blue-200 transition">About</a></li>
                                <li><a href="/contact" className="text-blue-100 hover:text-blue-200 transition">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}