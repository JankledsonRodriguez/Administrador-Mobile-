import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto overflow-hidden relative pt-8 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 200"
        className="w-full h-20 sm:h-28 block"
        preserveAspectRatio="none"
      >
        {/* Linha de destaque Laranja */}
        <path
          d="M0,30 C400,100 1000,0 1440,40 L1440,200 L0,200 Z"
          fill="#ff8928"
        />
        {/* Onda Azul Marinho */}
        <path
          d="M0,50 C400,120 1000,20 1440,60 L1440,200 L0,200 Z"
          fill="#002747"
        />
      </svg>
    </footer>
  );
};
