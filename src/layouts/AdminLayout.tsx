import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout encapsulates the administrator workspace.
 * Deliberately excludes the public student Navbar and Footer.
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100/80 font-sans text-slate-800 antialiased flex flex-col">
      {children}
    </div>
  );
};
