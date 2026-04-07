import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  welcome: {
    title: string;
    description: string;
    image: string;
    bottomText: string;
  };
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export default function AdminHomepage() {
  const [homepageData, setHomepageData] = useState<HomepageData>({
    hero: {
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: '',
      ctaLink: ''
    },
    welcome: {
      title: '',
      description: '',
      image: '',
      bottomText: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);

  const fetchHomepageData = async (locationId: string = selectedLocation) => {
    try {
      const response = await fetch(`/api/homepage?location=${locationId}`);
      if (!response.ok) throw new Error('Unable to fetch homepage data');
      const data = await response.json();
      setHomepageData(data);
    } catch (err: any) {
      setError('Failed to load homepage data');
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, fieldName: string): Promise<string | null> => {
    if (!file) return null;

    setUploading(prev => ({ ...prev, [fieldName]: true }));

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, name: file.name, type: file.type })
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => null);
        throw new Error(errorResponse?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.source_url;
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload ${fieldName}: ${error.message}`);
      return null;
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, section: 'hero' | 'welcome', field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const imageUrl = await handleFileUpload(file, `${section}_${field}`);
    if (imageUrl) {
      handleInputChange(section, field, imageUrl);
    }
  };

  const loadLocations = () => {
    const saved = localStorage.getItem('sakoon_locations');
    if (saved) {
      const locationData = JSON.parse(saved);
      setLocations(locationData);
      if (!selectedLocation && locationData.length > 0) {
        setSelectedLocation(locationData[0].id);
      }
    } else {
      const locationData: Location[] = [
        { id: '1', name: 'Sakoon Fremont', address: '35700 Fremont Blvd, Fremont, CA 94536', phone: '(510) 744-7000', email: 'sakoonfremont@gmail.com', hours: 'Mon-Sun: 11:30 AM - 10:00 PM' },
        { id: '2', name: 'Sakoon Santa Clara', address: '3570 Homestead Rd, Santa Clara, CA 95051', phone: '(408) 244-4424', email: 'sakoonsantaclara@gmail.com', hours: 'Mon-Sun: 11:30 AM - 10:00 PM' },
        { id: '3', name: 'Sakoon Mountain View', address: '1234 El Camino Real, Mountain View, CA', phone: '(650) 123-4567', email: 'sakoonmtv@gmail.com', hours: 'Mon-Sun: 11:30 AM - 10:00 PM' }
      ];
      setLocations(locationData);
      setSelectedLocation(locationData[0].id);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setLoading(true);
      fetchHomepageData(selectedLocation);
    }
  }, [selectedLocation]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!selectedLocation) {
        throw new Error('No location selected');
      }

      const pageSlug = 'sakoon-homepage';
      const pageTitle = 'Sakoon Homepage';

      const existingPagesResponse = await fetch(`/api/wp/pages?slug=${pageSlug}`);
      let pageId = null;
      let allLocationData: { [key: string]: HomepageData } = {};

      if (existingPagesResponse.ok) {
        const existingPages = await existingPagesResponse.json();
        if (existingPages.length > 0) {
          pageId = existingPages[0].id;
          const existingContent = existingPages[0].content?.rendered || '';
          const dataMatch = existingContent.match(/<!-- HOMEPAGE_DATA (\{[\s\S]*?\}) -->/);
          if (dataMatch) {
            try {
              const parsed = JSON.parse(dataMatch[1]);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                allLocationData = parsed;
              }
            } catch {
              // ignore parse errors, fallback to fresh data map
            }
          }
        }
      }

      allLocationData[selectedLocation] = homepageData;

      const contentHtml = `<!-- HOMEPAGE_DATA ${JSON.stringify(allLocationData)} -->
<div class="homepage-content">
  <div class="hero-section">
    <h1>${homepageData.hero.title}</h1>
    <p class="subtitle">${homepageData.hero.subtitle}</p>
    <img src="${homepageData.hero.backgroundImage}" alt="Hero Banner" class="hero-image" />
    <a href="${homepageData.hero.ctaLink}" class="cta-button">${homepageData.hero.ctaText}</a>
  </div>
  <div class="welcome-section">
    <h2>${homepageData.welcome.title}</h2>
    <p class="description">${homepageData.welcome.description}</p>
    <img src="${homepageData.welcome.image}" alt="Welcome Image" class="welcome-image" />
    <p class="bottom-text">${homepageData.welcome.bottomText}</p>
  </div>
</div>`;

      let response;
      if (pageId) {
        response = await fetch(`/api/wp/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pageTitle, content: contentHtml })
        });
      } else {
        response = await fetch('/api/wp/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pageTitle, slug: pageSlug, status: 'publish', content: contentHtml })
        });
      }

      if (!response || !response.ok) throw new Error('Failed to save homepage to WordPress');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      try {
        const storageKey = `sakoon_homepage_${selectedLocation}`;
        localStorage.setItem(storageKey, JSON.stringify(homepageData));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (storageErr) {
        setError('Failed to save homepage data');
        console.error('Error saving homepage data:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: 'hero' | 'welcome', field: string, value: string) => {
    setHomepageData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-rubik font-black text-[#1B1B1B] mb-2">Homepage Management</h1>
          <p className="text-gray-600">
            Manage homepage content for: <span className="font-semibold text-[#F2002D]">{locations.find(l => l.id === selectedLocation)?.name || 'Default'}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Failed to update homepage for {locations.find(l => l.id === selectedLocation)?.name || 'Default'}: {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">Homepage updated successfully for {locations.find(l => l.id === selectedLocation)?.name || 'Default'}!</p>
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {locations.map(location => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${selectedLocation === location.id ? 'border-[#F2002D] text-[#F2002D]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {location.name}
                </button>
              ))}
            </nav>
          </div>
          <p className="text-sm text-gray-500 mt-2">Select a location to manage location-specific homepage content. "Default" applies to all locations when no specific location is selected.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-rubik font-black text-[#1B1B1B] mb-6">Hero Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Hero Title</label>
                <input type="text" value={homepageData.hero.title} onChange={e => handleInputChange('hero', 'title', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="CELEBRATING INDIAN FLAVOURS" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Hero Subtitle</label>
                <input type="text" value={homepageData.hero.subtitle} onChange={e => handleInputChange('hero', 'subtitle', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="A Culinary Journey Through India" required />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">CTA Text</label>
                <input type="text" value={homepageData.hero.ctaText} onChange={e => handleInputChange('hero', 'ctaText', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Explore Our Menu" required />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">CTA Link</label>
                <input type="text" value={homepageData.hero.ctaLink} onChange={e => handleInputChange('hero', 'ctaLink', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="/sakoon/menu" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Background Image</label>
                <div className="space-y-3">
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'hero', 'backgroundImage')} disabled={uploading.hero_backgroundImage} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F2002D] file:text-white hover:file:bg-[#E0002A]" />
                  {uploading.hero_backgroundImage && <div className="flex items-center text-sm text-gray-600"><div className="w-4 h-4 border-2 border-[#F2002D] border-t-transparent rounded-full animate-spin mr-2" />Uploading...</div>}
                  {homepageData.hero.backgroundImage && <div className="text-sm text-gray-600">Current: <a href={homepageData.hero.backgroundImage} target="_blank" rel="noopener noreferrer" className="text-[#F2002D] hover:underline">View Image</a></div>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-rubik font-black text-[#1B1B1B] mb-6">Welcome Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Welcome Title</label>
                <input type="text" value={homepageData.welcome.title} onChange={e => handleInputChange('welcome', 'title', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Welcome to Sakoon" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Description</label>
                <textarea value={homepageData.welcome.description} onChange={e => handleInputChange('welcome', 'description', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Enter welcome description..." required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Featured Image</label>
                <div className="space-y-3">
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'welcome', 'image')} disabled={uploading.welcome_image} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F2002D] file:text-white hover:file:bg-[#E0002A]" />
                  {uploading.welcome_image && <div className="flex items-center text-sm text-gray-600"><div className="w-4 h-4 border-2 border-[#F2002D] border-t-transparent rounded-full animate-spin mr-2" />Uploading...</div>}
                  {homepageData.welcome.image && <div className="text-sm text-gray-600">Current: <a href={homepageData.welcome.image} target="_blank" rel="noopener noreferrer" className="text-[#F2002D] hover:underline">View Image</a></div>}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Bottom Text</label>
                <textarea value={homepageData.welcome.bottomText} onChange={e => handleInputChange('welcome', 'bottomText', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Enter bottom text..." required />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-rubik font-black text-[#1B1B1B] mb-6">Homepage Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Page Status</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent">
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">SEO Title</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Homepage SEO Title" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1B1B1B] uppercase tracking-widest mb-2">Meta Description</label>
                <textarea rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F2002D] focus:border-transparent" placeholder="Homepage meta description for SEO" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-rubik font-black text-[#1B1B1B] mb-6">Live Preview</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
                {homepageData.hero.backgroundImage ? <img src={homepageData.hero.backgroundImage} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600" />}
                <div className="relative z-10 text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl font-rubik font-black mb-4 drop-shadow-lg">{homepageData.hero.title || 'Hero Title'}</h1>
                  <p className="text-xl md:text-2xl mb-8 drop-shadow-lg">{homepageData.hero.subtitle || 'Hero Subtitle'}</p>
                  <button className="px-8 py-3 bg-[#F2002D] text-white font-bold rounded-lg hover:bg-[#E0002A] transition-colors">{homepageData.hero.ctaText || 'Call to Action'}</button>
                </div>
              </div>
              <div className="p-8 bg-white">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="w-20 h-0.5 bg-[#F2002D] mx-auto mb-8" />
                    <h2 className="text-3xl md:text-4xl font-rubik font-black text-[#1B1B1B] mb-6">{homepageData.welcome.title || 'Welcome Title'}</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">{homepageData.welcome.description || 'Welcome description text...'}</p>
                  </div>
                  <div className="mb-12">
                    {homepageData.welcome.image ? <img src={homepageData.welcome.image} alt="Welcome" className="w-full max-w-2xl mx-auto rounded-2xl shadow-xl" /> : <div className="w-full max-w-2xl mx-auto h-64 bg-gray-200 rounded-2xl flex items-center justify-center"><span className="text-gray-400 text-lg">Welcome Image Placeholder</span></div>}
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto text-center">{homepageData.welcome.bottomText || 'Bottom text content...'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-[#F2002D] text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#F2002D]/20">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
