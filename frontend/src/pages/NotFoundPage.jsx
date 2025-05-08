import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-mono">
      <div className="border-2 border-black p-8 text-center max-w-md">
        <h1 className="text-5xl font-bold mb-6">404</h1>
        <p className="text-xl mb-6">LOST IN WHITE SPACE</p>
        <p className="mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link 
          to="/" 
          className="inline-block border-2 border-black px-6 py-3 hover:bg-black hover:text-white"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;