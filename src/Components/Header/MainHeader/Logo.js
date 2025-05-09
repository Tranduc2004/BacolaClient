import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center mr-3">
      <a href="/" className="flex items-center">
        <div className="h-10 w-10 md:h-12 md:w-12 mr-2 bg-yellow-300 rounded-full flex items-center justify-center">
          <div className="text-blue-600 text-xl md:text-2xl">😀</div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">
            bacola
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Online Grocery Shopping Center
          </p>
        </div>
      </a>
    </div>
  );
};

export default Logo;
