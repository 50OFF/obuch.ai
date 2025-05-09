import React from 'react';

const color1 = import.meta.env.VITE_COLOR1;
const color2 = import.meta.env.VITE_COLOR2;
const color3 = import.meta.env.VITE_COLOR3;
const color4 = import.meta.env.VITE_COLOR4;

const Header = ({ onSettings }) => {
    return (
        <header
            className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center"
            style={{ backgroundColor: color2 }}
        >
            <h1
                className="text-4xl"
                style={{ fontFamily: '"Modak", system-ui' }}
            >
                CLARIF.AI
            </h1>
            <div className="space-x-2">
                <button
                    className="bg-white text-blue-600 px-3 py-1 rounded hover:cursor-pointer"
                    onClick={onSettings}
                >
                    Настройки
                </button>
            </div>
        </header>
    );
};

export default Header;
