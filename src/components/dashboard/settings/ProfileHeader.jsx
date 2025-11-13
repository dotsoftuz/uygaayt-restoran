import { useAppContext } from '@/context/AppContext';
import { Pencil, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';

function ProfileHeader({
  imageSrc,
  setImageSrc,
  imageSelected,
  setImageSelected,
  setIsFormChanged,
}) {
  const { userData } = useAppContext();
  const [storeData, setStoreData] = useState(null);
  const storeDataRef = useRef(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData?.photoURL) {
      setImageSrc(userData.photoURL);
    }
  }, [userData]);

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
          setStoreData(data);
          storeDataRef.current = data;
          localStorage.setItem('storeData', JSON.stringify(data));
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setImageSrc(fileReader.result);
        setImageSelected(true);
      };
      fileReader.readAsDataURL(file);
    }
    setIsFormChanged(true);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageSrc(null);
    setImageSelected(false);
    setIsFormChanged(false);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
            <img
              src={imageSrc ? imageSrc : '/assets/logos/uygaayt-shape.svg'}
              alt="Profile avatar"
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={handleImageClick}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileChange}
              multiple={false}
            />
            {imageSelected && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-1.5 -right-1.5 z-10 p-1.5 bg-background border border-border rounded-full text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label="Remove image"
              >
                <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleImageClick}
            >
              <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {storeData?.workTime ? formatWorkTime(storeData.workTime) : '08:00 - 20:00'}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold truncate">
                {storeData?.name || userData?.displayName || 'Uygaayt Super Admin'}
              </h3>
              {storeData?.isVerified && (
                <svg
                  title="Verified"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {storeData?.addressName || userData?.location || 'Jizzakh, Uzbekistan'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileHeader;
