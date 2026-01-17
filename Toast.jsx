import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className={`fixed top-5 right-5 z-50 transform transition-all duration-500 ease-out translate-x-0`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${type === 'success'
                    ? 'bg-green-50/90 border-green-200 text-green-800'
                    : 'bg-red-50/90 border-red-200 text-red-800'
                }`}>
                <div className={`${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-wide uppercase opacity-70 mb-0.5">
                        {type === 'success' ? 'Success' : 'Error'}
                    </h3>
                    <p className="font-medium text-base">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
