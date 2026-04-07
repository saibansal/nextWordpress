import React from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminHomepage() {
  return (
    <AdminLayout title="Homepage Settings">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Homepage Configuration</h2>
        <p className="text-gray-600 mb-6">Manage hero banner, welcome text, and locations for the frontend homepage.</p>
        {/* Homepage form goes here */}
      </div>
    </AdminLayout>
  );
}