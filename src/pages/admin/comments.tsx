import React from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminComments() {
  return (
    <AdminLayout title="Comments">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Manage Comments</h2>
        <p className="text-gray-600 mb-6">Approve, mark as spam, or delete user comments.</p>
        {/* Comments table goes here */}
      </div>
    </AdminLayout>
  );
}