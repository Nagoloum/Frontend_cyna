import React from 'react';
import Sidebar from '../Dashboard/SideBarComponent';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 grid grid-cols-12 gap-4 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}