import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

interface User {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  avatar_urls?: { [key: string]: string };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wp/users?context=edit&per_page=100'); 
      if (res.ok) {
        setUsers(await res.json());
      } else {
        throw new Error('Failed to load users');
      }

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading users from live site.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        username: currentUser.username,
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        name: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
        roles: currentUser.roles || ['customer'],
        ...(password && { password })
      };

      const url = isEditing ? `/api/wp/users/${currentUser.id}` : '/api/wp/users';
      const method = isEditing ? 'PUT' : 'POST';


      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `User ${isEditing ? 'updated' : 'created'} successfully!` });
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save user');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/wp/users/${id}?reassign=1&force=true`, { method: 'DELETE' });

      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentUser({ roles: ['customer'] });
    setPassword('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setPassword('');
    setShowModal(true);
  };

  if (!isMounted) return null;

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Users">
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#1d2327]">Users</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your team and customers directly.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Icons.Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2271b1] transition-colors" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#dcdcde] rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all w-full md:w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={openAddModal}
              className="bg-[#2271b1] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-[#2271b1]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Icons.Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest border animate-in slide-in-from-top-2 duration-300 flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <Icons.Check className="w-5 h-5" /> : <Icons.AlertTriangle className="w-5 h-5" />}
              {message.text}
            </div>
            <button onClick={() => setMessage(null)} className="opacity-40 hover:opacity-100">×</button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-[#dcdcde] rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-[#dcdcde] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-5">Username</th>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Email</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dcdcde]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-16 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-[#2271b1]/10 flex items-center justify-center overflow-hidden">
                            {user.avatar_urls ? (
                                <img src={user.avatar_urls['96']} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Icons.Users className="w-5 h-5 text-[#2271b1]" />
                            )}
                          </div>
                          <div>
                            <div className="font-black text-[#1d2327] text-sm">{user.username}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-[#1d2327]">{user.name || '—'}</td>
                      <td className="px-8 py-6 font-medium text-gray-500">{user.email}</td>
                      <td className="px-8 py-6">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black uppercase text-[9px] tracking-widest">
                          {user.roles?.[0] || 'Subscriber'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all text-gray-400 hover:text-[#2271b1]"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all text-gray-400 hover:text-red-500"
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No users found on your store.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border border-[#dcdcde] rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <form onSubmit={handleSave}>
                <div className="p-10 border-b border-[#dcdcde] flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="text-2xl font-black text-[#1d2327]">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure account details properly.</p>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-2xl hover:bg-white hover:shadow-lg flex items-center justify-center text-gray-400 transition-all">
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-10 grid grid-cols-2 gap-8 max-h-[600px] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                        <input 
                            disabled={isEditing}
                            required
                            type="text" 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all disabled:opacity-50"
                            placeholder="johndoe"
                            value={currentUser.username || ''}
                            onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <input 
                            required
                            type="email" 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all"
                            placeholder="john@example.com"
                            value={currentUser.email || ''}
                            onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all"
                            placeholder="John"
                            value={currentUser.first_name || ''}
                            onChange={(e) => setCurrentUser({...currentUser, first_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all"
                            placeholder="Doe"
                            value={currentUser.last_name || ''}
                            onChange={(e) => setCurrentUser({...currentUser, last_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Role</label>
                        <select 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all"
                            value={currentUser.roles?.[0] || 'customer'}
                            onChange={(e) => setCurrentUser({...currentUser, roles: [e.target.value]})}
                        >
                            <option value="administrator">Administrator</option>
                            <option value="editor">Editor</option>
                            <option value="author">Author</option>
                            <option value="contributor">Contributor</option>
                            <option value="subscriber">Subscriber</option>
                            <option value="customer">Customer</option>
                            <option value="shop_manager">Shop Manager</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{isEditing ? 'New Password (Optional)' : 'Password'}</label>
                        <input 
                            required={!isEditing}
                            type="password" 
                            className="w-full bg-gray-100/50 border border-[#dcdcde] rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#2271b1]/10 focus:border-[#2271b1] outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-10 border-t border-[#dcdcde] bg-gray-50/50 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-500 hover:bg-white transition-all hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-[#2271b1] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#2271b1]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
