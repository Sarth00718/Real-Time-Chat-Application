import React, { useEffect, useRef } from 'react'
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { BASE_URL } from '../main.jsx';

const Message = ({ message }) => {
    const scroll = useRef();
    const { authUser, selectedUser } = useSelector(store => store.user);
    const isOwnMessage = message?.senderId === authUser?._id;

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    // Function to format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const messageDate = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - messageDate) / (1000 * 60 * 60);

        // If message is from today, show only time
        if (diffInHours < 24 && messageDate.getDate() === now.getDate()) {
            return messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        // If message is from yesterday
        else if (diffInHours < 48 && messageDate.getDate() === now.getDate() - 1) {
            return `Yesterday ${messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}`;
        }
        // If message is older, show date and time
        else {
            return messageDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    };
    const getImageUrl = (profilePhoto) => {
        return `${BASE_URL}${profilePhoto}`;
    };

    return (
        <motion.div
            ref={scroll}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'} mb-4 px-2`}
        >
            <div className="chat-image avatar">
                <div className="w-8 h-8 rounded-full ring-1 ring-white/30">
                    <img
                        alt="User avatar"
                        src={getImageUrl(isOwnMessage ? authUser?.profilePhoto : selectedUser?.profilePhoto)}
                    />
                </div>
            </div>
            <div className="chat-header mb-1">
                <span className="text-xs opacity-70 text-white font-semibold">
                    {isOwnMessage ? "You" : selectedUser?.fullName}
                </span>
                <time className="text-xs opacity-50 ml-2 text-gray-300">
                    {formatTime(message?.createdAt || message?.timestamp)}
                </time>
            </div>
            <div className={`chat-bubble ${isOwnMessage
                ? 'bg-blue-900 text-white'
                : 'bg-white/20 backdrop-blur-sm text-white'
                } shadow-md min-w-[60px] min-h-[40px] px-4 py-2 text-base flex items-center break-words`}>
                <div className="space-y-2">
                    {/* Text Message */}
                    {message?.message && (
                        <p>{message.message}</p>
                    )}
                    {/* File Attachments */}
                    {message?.files?.length > 0 && message.files.map((file, index) => {
                        const fileUrl = file;
                        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file);
                        const originalFileName = file.split('/').pop();

                        return (
                            <div key={index}>
                                {isImage ? (
                                    <img
                                        src={fileUrl}
                                        alt={originalFileName}
                                        className="max-w-[200px] rounded-lg border border-white/20"
                                    />
                                ) : (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-200 underline break-all"
                                    >
                                        📄 {originalFileName}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="chat-footer opacity-50 text-xs flex gap-1 mt-1">
                {isOwnMessage && message?.read && <span>Seen</span>}
            </div>
        </motion.div>
    );
};

export default Message;