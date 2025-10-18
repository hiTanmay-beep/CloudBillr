'use client';
import React from 'react';

// --- Icon Components (using inline SVG for simplicity) ---
const PlusCircle = ({ className = "h-10 w-10" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const UserPlus = ({ className = "h-10 w-10" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="23" y1="11" x2="17" y2="11"></line>
        <line x1="20" y1="8" x2="20" y2="14"></line>
    </svg>
);

const BookOpen = ({ className = "h-10 w-10" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const BarChart = ({ className = "h-10 w-10" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
);

const X = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// --- Define types for ActionButton props ---
interface ActionButtonProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

// --- Reusable Components ---
const ActionButton = ({ title, description, icon, onClick }: ActionButtonProps) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-left w-full group transition-all duration-300 ease-in-out hover:bg-blue-600 hover:shadow-blue-500/50 transform hover:-translate-y-2 cursor-pointer"
    >
        <div className="mb-4 text-blue-500 group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-100 transition-colors duration-300">{description}</p>
    </button>
);

// --- Notification Component ---
const Notification = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
        <span>{message}</span>
        <button onClick={onClose} className="hover:bg-orange-600 p-1 rounded transition-colors">
            <X className="h-4 w-4" />
        </button>
    </div>
);

// --- Main Dashboard Component ---
export default function App() {
    const [currentDate, setCurrentDate] = React.useState('');
    const [notification, setNotification] = React.useState<string | null>(null);

    React.useEffect(() => {
        const date = new Date().toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        setCurrentDate(date);
    }, []);

    const handleCreateInvoice = () => {
        window.location.href = '/invoices/create';
    };

    const handleAddCustomer = () => {
        window.location.href = '/customers';
    };

    const handleBrokerLedger = () => {
        window.location.href = '/broker';
    };

    const handleViewReports = () => {
        setNotification('Coming Soon! This feature will be available shortly.');
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 font-sans text-gray-900 dark:text-gray-200">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* --- Header --- */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
                        {currentDate || 'Agra, Uttar Pradesh'}
                    </p>
                </div>

                {/* --- Action Buttons Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <ActionButton 
                        title="Create Invoice" 
                        description="Generate a new bill for a customer."
                        icon={<PlusCircle />}
                        onClick={handleCreateInvoice}
                    />
                    <ActionButton 
                        title="Add Customer" 
                        description="Add a new client to your records."
                        icon={<UserPlus />}
                        onClick={handleAddCustomer}
                    />
                    <ActionButton 
                        title="Broker Ledger" 
                        description="View and manage broker accounts."
                        icon={<BookOpen />}
                        onClick={handleBrokerLedger}
                    />
                    <ActionButton 
                        title="View Reports" 
                        description="Analyze your sales and financial data."
                        icon={<BarChart />}
                        onClick={handleViewReports}
                    />
                </div>
            </main>

            {/* --- Notification --- */}
            {notification && (
                <Notification 
                    message={notification} 
                    onClose={() => setNotification(null)} 
                />
            )}
        </div>
    );
}