import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../Context/AuthContext';
import { Bell, X, User, Phone, MapPin, CheckCircle } from 'lucide-react';

const NotificationList = ({ onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [error, setError] = useState(null);

    // Fetch notifications on mount
    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Subscribe to new notifications
            const subscription = supabase
                .channel('public:notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // If it's an order accepted notification, navigate to details page
        if (notification.type === 'ORDER_ACCEPTED') {
            onClose(); // Close the dropdown
            navigate('/order-details', { state: { data: notification.data } });
        } else {
            setSelectedNotification(notification);
        }
    };

    const closeModal = () => {
        setSelectedNotification(null);
    };

    return (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Bell size={18} /> Notifications
                </h3>
                <button
                    onClick={onClose}
                    className="text-green-100 hover:text-white p-1 rounded-full hover:bg-green-600/50 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 text-sm">{error}</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-green-50/50' : ''}`}
                            >
                                <div className="flex gap-3">
                                    {/* Icon/Avatar to indicate sender/type */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {/* Unread Dot */}
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal (Overlay) - Drill Down View */}
            {selectedNotification && selectedNotification.data && (
                <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="bg-green-50 px-4 py-3 flex justify-between items-center border-b border-green-100">
                        <h4 className="font-semibold text-green-900">Buyer Details</h4>
                        <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                <User size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedNotification.data.buyerName || 'Unknown Buyer'}</h3>
                            <p className="text-sm text-gray-500">Interested Buyer</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone size={18} className="text-green-600 mt-1" />

                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                                    <p className="text-gray-800 font-medium select-all">{selectedNotification.data.buyerPhone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-green-600 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                                    <p className="text-gray-800 font-medium">{selectedNotification.data.buyerLocation || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <CheckCircle size={18} className="text-green-600 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                                    <p className="text-green-700 font-bold">Offer Accepted</p>
                                    <p className="text-xs text-gray-500 mt-1">For {selectedNotification.data.cropName} (₹{selectedNotification.data.price})</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-xs text-center text-gray-400">
                                Contact the buyer to finalize the deal.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationList;
