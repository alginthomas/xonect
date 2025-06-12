
import React from 'react';

const AuthBrandHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-2xl font-semibold text-primary-foreground">X</span>
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Xonect</h1>
      <p className="text-sm text-muted-foreground">powered by Thomas & Niyogi</p>
    </div>
  );
};

export default AuthBrandHeader;
