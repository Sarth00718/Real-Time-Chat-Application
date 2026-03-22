/**
 * Format timestamp for message display
 */
export const formatMessageTime = (timestamp) => {
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

/**
 * Format last seen timestamp
 */
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Last seen recently';

  const lastSeenDate = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - lastSeenDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Last seen just now';
  } else if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `Last seen ${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Last seen yesterday';
  } else if (diffInDays < 7) {
    return `Last seen ${diffInDays}d ago`;
  } else {
    return lastSeenDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Format date for date separators
 */
export const formatMessageDate = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  }
};

/**
 * Group messages by date
 */
export const groupMessagesByDate = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) return [];
  
  const groupedMessages = [];
  let currentDate = null;
  
  messages.forEach((msg) => {
    // Skip invalid messages
    if (!msg || !msg._id) return;
    
    // Make sure we have a valid date
    const messageDate = new Date(msg.createdAt || msg.timestamp || Date.now());
    if (isNaN(messageDate.getTime())) return;
    
    const dateStr = messageDate.toLocaleDateString();
    
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({
        type: 'date',
        value: formatMessageDate(messageDate),
        id: `date-${dateStr}`
      });
    }
    
    groupedMessages.push({
      type: 'message',
      value: msg,
      id: msg._id
    });
  });
  
  return groupedMessages;
};
