import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = [40.1158, 67.8422];
const DEFAULT_ZOOM = 13;

const DashboardMap = ({ height = '600px', orderLocations = [] }) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const placemarksRef = useRef([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        if (window.ymaps) {
            setIsScriptLoaded(true);
            window.ymaps.ready(() => {
                initMap();
            });
            return;
        }

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
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=package.full';
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
            placemarksRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (mapRef.current && orderLocations.length > 0) {
            updatePlacemarks();
        }
    }, [orderLocations]);

    const initMap = () => {
        if (!containerRef.current || mapRef.current) return;

        try {
            let center = DEFAULT_CENTER;
            let zoom = DEFAULT_ZOOM;

            if (orderLocations.length > 0) {
                const bounds = orderLocations.reduce(
                    (acc, order) => {
                        const lat = order.addressLocation.latitude;
                        const lng = order.addressLocation.longitude;
                        if (lat && lng) {
                            acc.minLat = Math.min(acc.minLat, lat);
                            acc.maxLat = Math.max(acc.maxLat, lat);
                            acc.minLng = Math.min(acc.minLng, lng);
                            acc.maxLng = Math.max(acc.maxLng, lng);
                        }
                        return acc;
                    },
                    {
                        minLat: Infinity,
                        maxLat: -Infinity,
                        minLng: Infinity,
                        maxLng: -Infinity,
                    }
                );

                if (bounds.minLat !== Infinity) {
                    center = [
                        (bounds.minLat + bounds.maxLat) / 2,
                        (bounds.minLng + bounds.maxLng) / 2,
                    ];
                    const latDiff = bounds.maxLat - bounds.minLat;
                    const lngDiff = bounds.maxLng - bounds.minLng;
                    const maxDiff = Math.max(latDiff, lngDiff);

                    if (maxDiff > 0.1) zoom = 10;
                    else if (maxDiff > 0.05) zoom = 11;
                    else if (maxDiff > 0.02) zoom = 12;
                    else zoom = 13;
                }
            }

            const map = new window.ymaps.Map(containerRef.current, {
                center: center,
                zoom: zoom,
                controls: [
                    'zoomControl',
                    'fullscreenControl',
                    'geolocationControl',
                    'typeSelector',
                ],
            });

            mapRef.current = map;
            setIsLoading(false);

            if (orderLocations.length > 0) {
                updatePlacemarks();
            }
        } catch (error) {
            console.error('Map initialization error:', error);
            setIsLoading(false);
        }
    };

    const groupOrdersByArea = (orders) => {
        const groups = {};
        const CLUSTER_DISTANCE = 0.02;

        orders.forEach((order) => {
            const lat = order.addressLocation.latitude;
            const lng = order.addressLocation.longitude;

            let closestGroup = null;
            let minDistance = Infinity;

            for (const key in groups) {
                const group = groups[key];
                const distance = Math.sqrt(
                    Math.pow(group.latitude - lat, 2) + Math.pow(group.longitude - lng, 2)
                );

                if (distance < CLUSTER_DISTANCE && distance < minDistance) {
                    minDistance = distance;
                    closestGroup = group;
                }
            }

            if (closestGroup) {
                closestGroup.count += 1;
                closestGroup.orders.push(order);
                closestGroup.latitude =
                    (closestGroup.latitude * (closestGroup.count - 1) + lat) / closestGroup.count;
                closestGroup.longitude =
                    (closestGroup.longitude * (closestGroup.count - 1) + lng) / closestGroup.count;
                if (order.addressName && order.addressName !== "Noma'lum hudud") {
                    closestGroup.areaName = order.addressName;
                }
            } else {
                const areaName = order.addressName || "Noma'lum hudud";
                const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
                groups[key] = {
                    latitude: lat,
                    longitude: lng,
                    count: 1,
                    areaName: areaName,
                    orders: [order],
                };
            }
        });

        return Object.values(groups);
    };

    const getMarkerColor = (count) => {
        if (count > 20) return '#ef4444';
        if (count > 10) return '#f59e0b';
        if (count > 5) return '#eab308';
        return '#22c55e';
    };

    const getMarkerSize = (count) => {
        if (count > 20) return [50, 50];
        if (count > 10) return [40, 40];
        if (count > 5) return [35, 35];
        return [30, 30];
    };

    const updatePlacemarks = () => {
        if (!mapRef.current || !window.ymaps) return;

        placemarksRef.current.forEach((placemark) => {
            mapRef.current.geoObjects.remove(placemark);
        });
        placemarksRef.current = [];

        const locationGroups = groupOrdersByArea(orderLocations);

        locationGroups.forEach((group) => {
            const [width, height] = getMarkerSize(group.count);
            const color = getMarkerColor(group.count);
            const isHotSpot = group.count > 10;

            const svgIcon = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
          </defs>
          <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 2}" 
                  fill="${color}" stroke="white" stroke-width="2.5" opacity="0.95" filter="url(#shadow)"/>
          <text x="${width / 2}" y="${height / 2}" 
                text-anchor="middle" dominant-baseline="central" 
                fill="white" font-size="${Math.min(width, height) / 2.5}" font-weight="bold">
            ${group.count}
          </text>
        </svg>
      `;

            const iconDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgIcon)))}`;

            const placemark = new window.ymaps.Placemark(
                [group.latitude, group.longitude],
                {
                    balloonContentHeader: `<b>${group.areaName}${isHotSpot ? ' 🔥' : ''}</b>`,
                    balloonContentBody: `<p>Zakazlar soni: <b>${group.count}</b></p>${isHotSpot ? '<p style="color: #FF4500; font-weight: bold;">Qaynoq nuqta</p>' : ''}`,
                    balloonContentFooter: `<small>Koordinatalar: ${group.latitude.toFixed(4)}, ${group.longitude.toFixed(4)}</small>`,
                    hintContent: `${group.areaName}: ${group.count} zakaz`,
                },
                {
                    iconLayout: 'default#image',
                    iconImageHref: iconDataUrl,
                    iconImageSize: [width, height],
                    iconImageOffset: [-width / 2, -height / 2],
                }
            );

            if (group.count > 10) {
                const circleRadius = Math.min(500 + group.count * 20, 1500);
                const circle = new window.ymaps.Circle(
                    [[group.latitude, group.longitude], circleRadius],
                    {},
                    {
                        fillColor: color,
                        fillOpacity: 0.1,
                        strokeColor: color,
                        strokeOpacity: 0.5,
                        strokeWidth: 2,
                    }
                );
                mapRef.current.geoObjects.add(circle);
            }

            mapRef.current.geoObjects.add(placemark);
            placemarksRef.current.push(placemark);
        });
    };

    return (
        <div className="w-full rounded-lg overflow-hidden border relative bg-muted/20">
            <div ref={containerRef} style={{ width: '100%', height: height }} />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-sm text-muted-foreground">Xarita yuklanmoqda...</div>
                </div>
            )}
            {!isLoading && orderLocations.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
                    <div className="text-sm text-muted-foreground">Ma'lumot topilmadi</div>
                </div>
            )}
        </div>
    );
};

export default DashboardMap;

