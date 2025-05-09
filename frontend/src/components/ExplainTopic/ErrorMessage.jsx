import React from 'react';

const ErrorMessage = ({ error }) => (
    error ? <div className="text-[var(--color-error)] text-center mt-2">{error}</div> : null
);

export default ErrorMessage; 