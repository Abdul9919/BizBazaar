import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { useSocket } from "./Contexts/socketContext.jsx";

const NotificationIcon = () => {
    const { notifications, setNotifications } = useSocket();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleClearNotifications = () => setNotifications([]);

    return (
        <div className="relative inline-block ml-[95%] z-50 ">
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
                <FaBell size={24} />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3 border border-gray-200">
                    <h4 className="font-bold flex justify-between border-b pb-2">
                        Notifications
                        <button onClick={handleClearNotifications} className="text-blue-500 text-sm">
                            Clear
                        </button>
                    </h4>
                    <ul className="mt-2">
                        {notifications.length > 0 ? (
                            notifications.map((note, index) => (
                                <li key={index} className="p-2 border-b last:border-none">
                                    <strong>New Message From {note.senderUsername}</strong>
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No new notifications</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationIcon;
