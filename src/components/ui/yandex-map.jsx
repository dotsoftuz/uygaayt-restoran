import { useEffect, useRef, useState } from 'react';

const YandexMap = ({ 
  center, 
  onCoordinateChange, 
  onAddressChange,
  height = '400px',
  zoom = 14 
}) => {
  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Yandex Maps script yuklanganligini tekshirish
    if (window.ymaps) {
      setIsScriptLoaded(true);
      window.ymaps.ready(() => {
        initMap();
      });
      return;
    }

    // Script yuklash
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsScriptLoaded(true);
        window.ymaps.ready(() => {
          initMap();
        });
      });
      if (window.ymaps) {
        setIsScriptLoaded(true);
        window.ymaps.ready(() => {
          initMap();
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      window.ymaps.ready(() => {
        initMap();
      });
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      if (placemarkRef.current) {
        placemarkRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && placemarkRef.current && center?.latitude && center?.longitude) {
      const coords = [center.latitude, center.longitude];
      mapRef.current.setCenter(coords, zoom);
      placemarkRef.current.geometry.setCoordinates(coords);
    }
  }, [center, zoom]);

  const initMap = () => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter = center?.latitude && center?.longitude
      ? [center.latitude, center.longitude]
      : [41.315163390767026, 69.27958692367339]; // Toshkent default

    try {
      const map = new window.ymaps.Map(containerRef.current, {
        center: defaultCenter,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl', 'typeSelector']
      });

      mapRef.current = map;

      // Placemark yaratish
      const placemark = new window.ymaps.Placemark(
        defaultCenter,
        {
          balloonContent: 'Joyni tanlang yoki surib o\'zgartiring'
        },
        {
          draggable: true,
          preset: 'islands#redDotIcon'
        }
      );

      placemarkRef.current = placemark;
      map.geoObjects.add(placemark);

      // Xaritada click qilganda
      map.events.add('click', (e) => {
        const coords = e.get('coords');
        updateCoordinates(coords);
      });

      // Placemark drag qilganda
      placemark.events.add('dragend', () => {
        const coords = placemark.geometry.getCoordinates();
        updateCoordinates(coords);
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }
  };

  const updateCoordinates = async (coords) => {
    const [latitude, longitude] = coords;
    
    // Koordinatalarni yangilash
    if (onCoordinateChange) {
      onCoordinateChange({ latitude, longitude });
    }

    // Reverse geocoding - koordinatalardan manzil olish
    try {
      window.ymaps.geocode([latitude, longitude], {
        kind: 'house',
        results: 1
      }).then((res) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          // Avval getAddressLine() dan foydalanish - bu eng to'g'ri manzilni beradi
          let address = firstGeoObject.getAddressLine();
          
          // Agar getAddressLine() koordinatalarni qaytarsa yoki bo'sh bo'lsa
          if (!address || address.trim() === '' || /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address.trim()) || /\d+\.\d+,\s*\d+\.\d+/.test(address)) {
            // Manzil qismlarini alohida olish
            const thoroughfare = firstGeoObject.getThoroughfare() || '';
            const premise = firstGeoObject.getPremise() || '';
            const premiseNumber = firstGeoObject.getPremiseNumber() || '';
            const street = firstGeoObject.getStreet() || '';
            const locality = firstGeoObject.getLocalities()?.[0] || '';
            const dependentLocality = firstGeoObject.getDependentLocalities()?.[0] || '';
            const subAdministrativeArea = firstGeoObject.getSubAdministrativeAreas()?.[0] || '';
            const administrativeArea = firstGeoObject.getAdministrativeAreas()?.[0] || '';
            
            // Manzilni qismlarga ajratib yig'ish
            const addressParts = [];
            
            // Ko'cha nomi
            if (thoroughfare) {
              addressParts.push(thoroughfare);
            } else if (street) {
              addressParts.push(street);
            }
            
            // Uy raqami
            if (premiseNumber) {
              addressParts.push(premiseNumber);
            } else if (premise) {
              addressParts.push(premise);
            }
            
            // Shahar/tuman
            if (dependentLocality) {
              addressParts.push(dependentLocality);
            } else if (locality) {
              addressParts.push(locality);
            }
            
            // Viloyat
            if (subAdministrativeArea) {
              addressParts.push(subAdministrativeArea);
            } else if (administrativeArea && !addressParts.includes(administrativeArea)) {
              addressParts.push(administrativeArea);
            }
            
            // Agar qismlar topilgan bo'lsa, ularni birlashtirish
            if (addressParts.length > 0) {
              address = addressParts.join(', ');
            } else {
              // Agar hech narsa topilmasa, name property'dan foydalanish
              const name = firstGeoObject.properties.get('name');
              if (name) {
                // Name property koordinatalardan iborat bo'lmasligini tekshirish
                const isNameCoordinates = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(name.trim());
                if (!isNameCoordinates && !/\d+\.\d+,\s*\d+\.\d+/.test(name)) {
                  address = name;
                }
              }
            }
          }
          
          // Yana bir bor tekshirish - agar address koordinatalardan iborat bo'lsa, uni tozalash
          if (address && (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address.trim()) || /\d+\.\d+,\s*\d+\.\d+/.test(address))) {
            // Koordinatalardan foydalanmaslik, balki shahar/tuman nomini ishlatish
            const locality = firstGeoObject.getLocalities()?.[0] || '';
            const administrativeArea = firstGeoObject.getAdministrativeAreas()?.[0] || '';
            const dependentLocality = firstGeoObject.getDependentLocalities()?.[0] || '';
            
            if (locality) {
              address = locality;
            } else if (dependentLocality) {
              address = dependentLocality;
            } else if (administrativeArea) {
              address = administrativeArea;
            } else {
              // Agar hech narsa topilmasa, bo'sh qoldirish (koordinatalardan foydalanmaslik)
              address = '';
              console.warn('Manzil topilmadi va koordinatalardan foydalanilmaydi');
            }
          }
          
          // Faqat to'g'ri manzil bo'lsa addressName ga qo'yish
          if (onAddressChange && address && address.trim() !== '' && !/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address.trim()) && !/\d+\.\d+,\s*\d+\.\d+/.test(address)) {
            onAddressChange(address);
          } else if (onAddressChange && (!address || address.trim() === '')) {
            // Agar manzil topilmasa, hech narsa qo'ymaslik
            console.warn('To\'g\'ri manzil topilmadi, addressName yangilanmaydi');
          }
        } else {
          // Agar aniq manzil topilmasa, koordinatalardan foydalanmaslik
          console.warn('GeoObject topilmadi, manzil o\'rnatilmaydi');
        }
      }).catch((error) => {
        console.error('Geocoding error:', error);
        // Xatolik bo'lsa ham koordinatalarni addressName ga qo'ymaslik
        console.warn('Geocoding xatosi, manzil o\'rnatilmaydi');
      });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border relative">
      <div ref={containerRef} style={{ width: '100%', height: height }} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-sm text-muted-foreground">Xarita yuklanmoqda...</div>
        </div>
      )}
    </div>
  );
};

export default YandexMap;

