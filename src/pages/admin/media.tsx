import React from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminMedia() {
  return (
    <AdminLayout title="Media Library">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Media Library</h2>
        <p className="text-gray-600 mb-6">Upload and manage all images and files for the site.</p>
        {/* Media Library Grid goes here */}
      </div>
    </AdminLayout>
  );
}