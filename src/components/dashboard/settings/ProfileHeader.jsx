import { useAppContext } from '@/context/AppContext';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { MapPin, Clock } from 'lucide-react';

// Helper function to format image URL
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  let url = imageUrl;
  if (url.startsWith('uploads/')) {
    url = url.replace('uploads/', '');
  }
  return `${cleanBaseUrl}/uploads/${url}`;
};

function ProfileHeader({
  imageSrc,
}) {
  const { userData } = useAppContext();
  const [storeData, setStoreData] = useState(null);
  const storeDataRef = useRef(null);
  const [bannerSrc, setBannerSrc] = useState(null);

  // Load logo from storeData - this is handled by parent component now

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      // First try to get from localStorage
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const cachedData = JSON.parse(storeDataStr);
          if (cachedData && Object.keys(cachedData).length > 0) {
            setStoreData(cachedData);
            storeDataRef.current = cachedData;
          }
        }
      } catch (error) {
        console.error('Error parsing cached store data:', error);
      }

      // Then try to fetch from API
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const response = await api.get('/store/get');
        const data = response?.data || response;

        if (data) {
          // Merge with existing localStorage data to preserve logo and banner if backend doesn't return it
          try {
            const existingStoreDataStr = localStorage.getItem('storeData');
            if (existingStoreDataStr) {
              const existingStoreData = JSON.parse(existingStoreDataStr);
              // If backend data doesn't have logo but localStorage does, preserve it
              if (!data.logo && existingStoreData.logo) {
                data.logo = existingStoreData.logo;
              }
              // If backend data doesn't have banner but localStorage does, preserve it
              if (!data.banner && existingStoreData.banner) {
                data.banner = existingStoreData.banner;
              }
            }
          } catch (e) {
            console.error('Error merging store data:', e);
          }

          setStoreData(data);
          storeDataRef.current = data;
          localStorage.setItem('storeData', JSON.stringify(data));

          // Set banner image
          if (data.banner?.url) {
            const bannerUrl = formatImageUrl(data.banner.url);
            setBannerSrc(bannerUrl);
          } else {
            setBannerSrc(null);
          }

          // Trigger localStorage change event
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        // If API fails, use cached data if available
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            const cachedData = JSON.parse(storeDataStr);
            if (cachedData && Object.keys(cachedData).length > 0) {
              setStoreData(cachedData);
              storeDataRef.current = cachedData;
            }
          }
        } catch (parseError) {
          console.error('Error parsing cached store data:', parseError);
        }
      }
    };

    fetchStoreData();

    // Listen for store data updates from localStorage
    const handleStorageChange = () => {
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const cachedData = JSON.parse(storeDataStr);
          if (cachedData && Object.keys(cachedData).length > 0) {
            // Only update if data has actually changed
            const currentDataStr = JSON.stringify(storeDataRef.current);
            const newDataStr = JSON.stringify(cachedData);
            if (currentDataStr !== newDataStr) {
              setStoreData(cachedData);
              storeDataRef.current = cachedData;

              // Update banner image
              if (cachedData.banner?.url) {
                const bannerUrl = formatImageUrl(cachedData.banner.url);
                setBannerSrc(bannerUrl);
              } else {
                setBannerSrc(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing store data on storage change:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events (when localStorage is updated in same tab)
    window.addEventListener('localStorageChange', handleStorageChange);

    // Poll localStorage periodically to catch updates from same tab
    // Only check if component is still mounted and visible
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleStorageChange();
      }
    }, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Format work time from "08:00-20:00" to "08:00 - 20:00"
  const formatWorkTime = (workTime) => {
    if (!workTime) return '08:00 - 20:00';
    return workTime.replace('-', ' - ');
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {/* Banner Image Section */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="Store banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30" />
        )}

        {/* Logo Overlay */}
        <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-20">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 border-4 border-background shadow-xl rounded-xl overflow-hidden bg-background">
            <img
              src={imageSrc ? imageSrc : '/assets/logos/uygaayt-shape.svg'}
              alt="Store logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Store Info Overlay */}
        <div className="absolute left-32 sm:left-36 md:left-40 bottom-4 sm:bottom-6 right-4 sm:right-6 z-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-background drop-shadow-lg mb-1.5 truncate">
                {storeData?.name || userData?.displayName || 'Uygaayt Super Admin'}
              </h2>

              {/* Store Details */}
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-back drop-shadow-md text-background">
                {storeData?.addressName || userData?.location ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {storeData?.addressName || userData?.location || 'Jizzakh, Uzbekistan'}
                    </span>
                  </div>
                ) : null}

                {storeData?.workTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{formatWorkTime(storeData.workTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            {storeData?.isActive !== undefined && (
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-md ${storeData.isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                    }`}
                >
                  {storeData.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent pointer-events-none" />
      </div>
    </Card>
  );
}

export default ProfileHeader;
