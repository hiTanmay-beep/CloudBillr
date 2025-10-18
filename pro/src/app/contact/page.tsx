'use client';

import { useState, ReactNode } from 'react';

// --- SVG Icons ---
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// --- Accordion Component for FAQ ---
interface AccordionItemProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem = ({ title, children, isOpen, onClick }: AccordionItemProps) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left py-5 px-6 focus:outline-none"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <ChevronDownIcon isOpen={isOpen} />
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
            <div className="p-6 pt-0 text-gray-600 dark:text-gray-300">
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
    const [openFaq, setOpenFaq] = useState<number | null>(0); // Keep first FAQ open by default

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold text-white mb-6">Get In Touch</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
                            {submitted && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                                    <p className="text-green-800 dark:text-green-200">✅ Thank you! Your message has been sent successfully.</p>
                                </div>
                            )}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
                                    <p className="text-red-800 dark:text-red-200">❌ {error}</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Form fields remain the same */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" placeholder="Your Name" required />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" placeholder="your@email.com" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number (Optional)</label>
                                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" placeholder="+91 123 456 7890" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                                    <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" placeholder="How can we help?" required />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" placeholder="Your message..." required />
                                </div>
                                <div>
                                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                                        {loading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</>) : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                                <div className="space-y-6 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-start space-x-4"><div className="flex-shrink-0 pt-1"><LocationIcon /></div><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Our Office</h3><p>123 Innovation Drive, Tech Park</p><p>Agra, Uttar Pradesh, 282001, India</p></div></div>
                                    <div className="flex items-start space-x-4"><div className="flex-shrink-0 pt-1"><PhoneIcon /></div><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3><a href="tel:+911234567890" className="hover:text-blue-600 dark:hover:text-blue-400 transition">+91 123 456 7890</a></div></div>
                                    <div className="flex items-start space-x-4"><div className="flex-shrink-0 pt-1"><EmailIcon /></div><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3><a href="mailto:contact@cloudbillr.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">contact@cloudbillr.com</a></div></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"><div className="h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><p className="text-gray-500 dark:text-gray-400">Map Placeholder</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={index}
                                title={item.q}
                                isOpen={openFaq === index}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <p>{item.a}</p>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}

