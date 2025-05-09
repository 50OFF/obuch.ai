// components/Modal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Размытый фон */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/40"
                onClick={onClose}
            />

            {/* Контент модального окна */}
            <div className="relative z-10 max-w-xl w-full mx-4">{children}</div>
        </div>,
        document.body
    );
};

export default Modal;
