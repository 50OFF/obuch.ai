import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import Loader from './Loader';

const MessageList = ({ messages, isLoading }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
            style={{
                background: 'var(--color-background)',
                color: 'var(--color-text)',
            }}
        >
            {messages.length > 0
                ? messages.map((msg, index) => (
                      <ChatMessage
                          key={index}
                          message={msg.content}
                          isUserMessage={msg.role === 'user'}
                      />
                  ))
                : null}
            {isLoading && <Loader />}
        </div>
    );
};

export default MessageList;
