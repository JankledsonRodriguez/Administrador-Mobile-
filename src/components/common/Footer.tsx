import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto overflow-hidden relative pt-10 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 200"
        className="w-full h-32 sm:h-40 block"
        preserveAspectRatio="none"
      >
        {/* Linha de destaque Laranja */}
        <path
          d="M0,10 C400,90 1000,-10 1440,30 L1440,200 L0,200 Z"
          fill="#ff8928"
        />
        {/* Onda Azul Marinho */}
        <path
          d="M0,35 C400,115 1000,15 1440,55 L1440,200 L0,200 Z"
          fill="#002747"
        />
      </svg>
    </footer>
  );
};
