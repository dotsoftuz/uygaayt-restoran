import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  DollarSign,
  User,
  Building,
  Circle,
  PlayCircle,
} from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import api from '@/services/api';

// Backend order formatidan frontend formatiga o'tkazish
const mapOrderFromBackend = (backendOrder) => {
  console.log('🔍 mapOrderFromBackend - Input:', backendOrder);

  if (!backendOrder) {
    console.error('🔍 mapOrderFromBackend - backendOrder is null or undefined');
    return null;
  }

  const customer = backendOrder.customer || backendOrder.receiverCustomer || {};
  const state = backendOrder.state || {};

  // Order ID ni formatlash
  const orderId = backendOrder.number
    ? `ORD-${String(backendOrder.number).padStart(6, '0')}`
    : backendOrder._id || backendOrder.id || 'ORD-000000';

  // Status index (timeline uchun)
  const getStatusIndex = (state) => {
    if (!state || !state.state) return 0;
    const stateStr = state.state;
    switch (stateStr) {
      case 'created':
        return 1;
      case 'inProcess':
        return 2;
      case 'inDelivery':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Items mapping - yaxshiroq error handling
  const items = (backendOrder.items || []).map((item, index) => {
    console.log(`🔍 Mapping item ${index}:`, item);

    // Product name ni olish - turli variantlarni tekshirish
    let productName = 'Noma\'lum mahsulot';
    if (item.product) {
      if (typeof item.product.name === 'string') {
        productName = item.product.name;
      } else if (item.product.name && typeof item.product.name === 'object') {
        // Agar name object bo'lsa (multi-language)
        productName = item.product.name.uz || item.product.name.ru || Object.values(item.product.name)[0] || 'Noma\'lum mahsulot';
      }
    } else if (item.name) {
      productName = typeof item.name === 'string' ? item.name : (item.name.uz || item.name.ru || Object.values(item.name)[0] || 'Noma\'lum mahsulot');
    }

    let variant = '';
    if (item.attributes && Array.isArray(item.attributes) && item.attributes.length > 0) {
      variant = item.attributes
        .map(attr => {
          if (typeof attr.attributeItem === 'string') {
            return attr.attributeItem;
          }
          if (attr.name && attr.value) {
            return `${attr.name}: ${attr.value}`;
          }
          return '';
        })
        .filter(Boolean)
        .join(', ');
    }

    const mappedItem = {
      name: productName,
      variant: variant,
      quantity: item.amount || item.quantity || 1,
      price: item.price || item.itemPrice || 0,
      product: item.product || {},
      attributes: item.attributes || [],
    };

    console.log(`🔍 Mapped item ${index}:`, mappedItem);
    return mappedItem;
  });

  console.log('🔍 Total items mapped:', items.length);

  // Address
  const address = backendOrder.addressName || '';
  const addressLocation = backendOrder.addressLocation || {};
  const fullAddress = address +
    (backendOrder.houseNumber ? `, ${backendOrder.houseNumber}` : '') +
    (backendOrder.entrance ? `, ${backendOrder.entrance}` : '') +
    (backendOrder.apartmentNumber ? `, ${backendOrder.apartmentNumber}` : '') +
    (backendOrder.floor ? `, ${backendOrder.floor}` : '');

  return {
    id: orderId,
    _id: backendOrder._id || backendOrder.id,
    number: backendOrder.number,
    clientName: customer.firstName
      ? `${customer.firstName} ${customer.lastName || ''}`.trim()
      : customer.name || 'Noma\'lum mijoz',
    phone: customer.phoneNumber || customer.phone || '',
    address: fullAddress || address,
    addressLocation: addressLocation,
    deliveryNotes: backendOrder.comment || '',
    items: items,
    paymentStatus: backendOrder.paymentState === 'completed' ? 'paid' : 'unpaid',
    paymentType: backendOrder.paymentType || 'cash',
    status: state.state || 'created',
    statusIndex: getStatusIndex(state),
    state: state,
    deliveryType: backendOrder.type === 'immediate' ? 'delivery' : 'pickup',
    createdAt: backendOrder.createdAt ? new Date(backendOrder.createdAt) : new Date(),
    acceptedAt: backendOrder.acceptedAt ? new Date(backendOrder.acceptedAt) : null,
    inProcessAt: backendOrder.inProcessAt ? new Date(backendOrder.inProcessAt) : null,
    inDeliveryAt: backendOrder.inDeliveryAt ? new Date(backendOrder.inDeliveryAt) : null,
    completedAt: backendOrder.completedAt ? new Date(backendOrder.completedAt) : null,
    appliedPromo: backendOrder.promocodePrice > 0 ? {
      code: backendOrder.promocodeCode || 'PROMO',
      type: 'fixed',
      discountValue: backendOrder.promocodePrice,
      discountAmount: backendOrder.promocodePrice,
    } : null,
    store: backendOrder.store,
    storeId: backendOrder.storeId,
    orderStructureType: backendOrder.orderStructureType || 'singleStore',
    stores: backendOrder.stores || [],
    itemPrice: backendOrder.itemPrice || 0,
    deliveryPrice: backendOrder.deliveryPrice || 0,
    discount: backendOrder.discount || 0,
    promocodePrice: backendOrder.promocodePrice || 0,
    usedBalance: backendOrder.usedBalance || 0,
    totalPrice: backendOrder.totalPrice || 0,
    customer: customer,
    courier: backendOrder.courier,
    employee: backendOrder.employee,
    rate: backendOrder.rate,
    rateComment: backendOrder.rateComment,
    rateComments: backendOrder.rateComments || [],
  };
};

// Order Products Component
const OrderProducts = ({ order }) => {
  const statusLabels = {
    created: 'Yaratildi',
    inProcess: 'Jarayonda',
    inDelivery: 'Yetkazib berishda',
    completed: 'Tugallangan',
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(11, 19);
  };

  const getImageUrl = (image) => {
    if (!image || !image.url) {
      console.log('🔍 getImageUrl - No image or url:', image);
      return null;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
    // Base URL'ni tozalash - trailing slash'ni olib tashlash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    // Backend'dan kelgan URL: 'uploads/1763466603309.jpeg'
    // ServeStaticModule '/v1/uploads' path'ida serve qiladi
    let url = image.url;
    // Agar URL 'uploads/' bilan boshlansa, faqat fayl nomini olish
    if (url.startsWith('uploads/')) {
      url = url.replace('uploads/', '');
    }
    // To'g'ri URL'ni yaratish: baseUrl + /uploads/ + filename
    // baseUrl allaqachon /v1 ni o'z ichiga oladi, shuning uchun /v1/uploads/ bo'ladi
    const finalUrl = `${cleanBaseUrl}/uploads/${url}`;
    console.log('🔍 getImageUrl - Base URL:', baseUrl, 'Clean:', cleanBaseUrl, 'Image URL:', image.url, 'Final:', finalUrl);
    return finalUrl;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Buyurtma mahsulotlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {/* Created Status */}
            <div className="flex flex-col items-center gap-2 z-10 bg-background relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${order.statusIndex >= 1
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 border-muted-foreground/30'
                }`}>
                {order.statusIndex >= 1 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${order.statusIndex >= 1 ? 'text-primary' : 'text-muted-foreground/60'}`}>
                  Yaratildi
                </p>
                <p className={`text-xs mt-0.5 ${order.statusIndex >= 1 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {formatTime(order.createdAt) || '-'}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            <div className={`flex-1 h-0.5 mx-2 transition-all ${order.statusIndex >= 2 ? 'bg-primary' : 'bg-muted/30'
              }`}></div>

            {/* Accepted Status */}
            <div className="flex flex-col items-center gap-2 z-10 bg-background relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${order.statusIndex >= 2
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 border-muted-foreground/30'
                }`}>
                {order.statusIndex >= 2 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : order.statusIndex === 1 ? (
                  <Clock className="w-4 h-4 text-muted-foreground/50" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${order.statusIndex >= 2 ? 'text-primary' : 'text-muted-foreground/60'}`}>
                  Qabul qilindi
                </p>
                <p className={`text-xs mt-0.5 ${order.statusIndex >= 2 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {formatTime(order.acceptedAt) || '-'}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            <div className={`flex-1 h-0.5 mx-2 transition-all ${order.statusIndex >= 3 ? 'bg-primary' : 'bg-muted/30'
              }`}></div>

            {/* In Delivery Status */}
            <div className="flex flex-col items-center gap-2 z-10 bg-background relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${order.statusIndex >= 3
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 border-muted-foreground/30'
                }`}>
                {order.statusIndex >= 3 ? (
                  <Truck className="w-5 h-5" />
                ) : order.statusIndex === 2 ? (
                  <Clock className="w-4 h-4 text-muted-foreground/50" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${order.statusIndex >= 3 ? 'text-primary' : 'text-muted-foreground/60'}`}>
                  Yetkazilmoqda
                </p>
                <p className={`text-xs mt-0.5 ${order.statusIndex >= 3 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {formatTime(order.inDeliveryAt) || '-'}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            <div className={`flex-1 h-0.5 mx-2 transition-all ${order.statusIndex >= 4 ? 'bg-primary' : 'bg-muted/30'
              }`}></div>

            {/* Completed Status */}
            <div className="flex flex-col items-center gap-2 z-10 bg-background relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${order.statusIndex >= 4
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 border-muted-foreground/30'
                }`}>
                {order.statusIndex >= 4 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : order.statusIndex === 3 ? (
                  <Clock className="w-4 h-4 text-muted-foreground/50" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${order.statusIndex >= 4 ? 'text-primary' : 'text-muted-foreground/60'}`}>
                  Tugallandi
                </p>
                <p className={`text-xs mt-0.5 ${order.statusIndex >= 4 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {formatTime(order.completedAt) || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {order.items.map((item, index) => {
            console.log(`🔍 Product ${index}:`, item);
            console.log(`🔍 Product ${index} - product:`, item.product);
            console.log(`🔍 Product ${index} - mainImage:`, item.product?.mainImage);
            const imageUrl = getImageUrl(item.product?.mainImage);
            console.log(`🔍 Product ${index} - imageUrl:`, imageUrl);
            return (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`🔍 Image load error for product ${index}:`, imageUrl);
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log(`🔍 Image loaded successfully for product ${index}:`, imageUrl);
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">{item.name}</p>
                  {item.variant && item.attributes && item.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.attributes.map((attr, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {typeof attr.attributeItem === 'string' ? attr.attributeItem : `${attr.name}: ${attr.value}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {item.quantity} x {formatNumber(item.price)} so'm
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm sm:text-base">
                    {formatNumber(item.price * item.quantity)} so'm
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary - moved to end */}
        <div className="border-t pt-4 space-y-3 bg-muted/20 rounded-lg p-4 -mx-4 -mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Barcha mahsulotlar:</span>
            <span className="font-medium">{formatNumber(order.itemPrice)} so'm</span>
          </div>
          {order.deliveryPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yetkazib berish:</span>
              <span className="font-medium">{formatNumber(order.deliveryPrice)} so'm</span>
            </div>
          )}
          {order.usedBalance > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Foydalanilgan balans:</span>
              <span className="font-medium text-primary">-{formatNumber(order.usedBalance)} so'm</span>
            </div>
          )}
          {order.promocodePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Promo kod:</span>
              <span className="font-medium text-primary">-{formatNumber(order.promocodePrice)} so'm</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chegirma:</span>
              <span className="font-medium text-primary">-{formatNumber(order.discount)} so'm</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base sm:text-lg pt-3 border-t">
            <span>Umumiy:</span>
            <span className="text-primary">{formatNumber(order.totalPrice)} so'm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Order Info Component
const OrderInfo = ({ order }) => {
  const getImageUrl = (image) => {
    if (!image || !image.url) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    // Backend'dan kelgan URL: 'uploads/1763466603309.jpeg'
    // ServeStaticModule '/v1/uploads' path'ida serve qiladi
    let url = image.url;
    if (url.startsWith('uploads/')) {
      url = url.replace('uploads/', '');
    }
    // To'g'ri URL'ni yaratish: baseUrl + /uploads/ + filename
    return `${cleanBaseUrl}/uploads/${url}`;
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-4">
      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            To'lov ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">To'lov turi:</span>
            <Badge variant="outline">
              {order.paymentType === 'cash' ? 'Naqd' : 'Karta'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Holat:</span>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
              {order.paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mijoz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {order.customer?.image ? (
                <img
                  src={getImageUrl(order.customer.image)}
                  alt={order.clientName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base truncate">{order.clientName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-muted-foreground">{order.phone}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCall(order.phone)}
                >
                  <Phone className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Manzil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm break-words leading-relaxed">{order.address || 'Manzil ko\'rsatilmagan'}</p>
          </div>
          {order.deliveryNotes && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-foreground">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Eslatma:</span>{' '}
                <span className="text-muted-foreground">{order.deliveryNotes}</span>
              </p>
            </div>
          )}
          {order.addressLocation?.latitude && order.addressLocation?.longitude && (
            <div className="mt-2 rounded-lg overflow-hidden border shadow-sm">
              <iframe
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${order.addressLocation.latitude},${order.addressLocation.longitude}&output=embed&zoom=15`}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courier Info */}
      {order.courier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Kuryer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                {order.courier.image ? (
                  <img
                    src={getImageUrl(order.courier.image)}
                    alt={order.courier.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">
                  {order.courier.firstName} {order.courier.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {order.courier.phoneNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCall(order.courier.phoneNumber)}
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            {order.courier.carBrand && order.courier.carNumber && (
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-xs sm:text-sm font-medium">{order.courier.carBrand}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{order.courier.carNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Store Info */}
      {order.store && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Do'kon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-sm sm:text-base">{order.store.name}</p>
            {order.store.phoneNumber && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{order.store.phoneNumber}</p>
            )}
            {order.store.addressName && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">📍 {order.store.addressName}</p>
            )}
            {order.orderStructureType === 'combined' && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  ℹ️ Bu birlashtirilgan buyurtma. Faqat sizning do'koningiz mahsulotlari ko'rsatilmoqda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating & Comments */}
      {order.status === 'completed' && (order.rate || order.rateComment || order.rateComments?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Reyting va izoh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.rateComment && (
              <p className="text-sm border-b pb-3">{order.rateComment}</p>
            )}
            {order.rate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Reyting:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= order.rate ? 'text-yellow-400' : 'text-muted-foreground'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {order.rateComments && order.rateComments.length > 0 && (
              <div className="space-y-2 pt-3">
                {order.rateComments.map((comment, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {comment.image && (
                      <img
                        src={getImageUrl(comment.image)}
                        alt="comment"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <p className="text-sm flex-1">{comment.title}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // API dan order ma'lumotlarini olish
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast.error('Buyurtma ID topilmadi');
        navigate('/dashboard/orders');
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/store/order/get-by-id/${orderId}`);
        console.log('🔍 Order Detail - Raw Response:', response);
        console.log('🔍 Order Detail - Response Type:', typeof response);
        console.log('🔍 Order Detail - Response Items:', response?.items);
        console.log('🔍 Order Detail - Items Length:', response?.items?.length);

        // Agar response.data ichida bo'lsa, uni olish
        const orderData = response?.data || response;
        console.log('🔍 Order Detail - Order Data:', orderData);
        console.log('🔍 Order Detail - Order Data Items:', orderData?.items);

        const mappedOrder = mapOrderFromBackend(orderData);
        console.log('🔍 Order Detail - Mapped Order:', mappedOrder);
        console.log('🔍 Order Detail - Mapped Items:', mappedOrder.items);
        console.log('🔍 Order Detail - Mapped Items Length:', mappedOrder.items?.length);

        setOrder(mappedOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        console.error('Error response:', error.response);
        toast.error('Buyurtma ma\'lumotlarini yuklashda xatolik yuz berdi');
        navigate('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Buyurtma ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Buyurtma topilmadi</p>
      </div>
    );
  }

  const statusLabels = {
    created: 'Yaratildi',
    inProcess: 'Jarayonda',
    inDelivery: 'Yetkazib berishda',
    completed: 'Tugallangan',
    cancelled: 'Bekor qilingan',
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/orders')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="title truncate">
              Buyurtma #{order.id}
            </h2>
            <p className="paragraph">
              {formatDate(order.createdAt.getTime())}
            </p>
          </div>
        </div>
        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Products */}
        <div className="lg:col-span-2">
          <OrderProducts order={order} />
        </div>

        {/* Right Column - Info */}
        <div>
          <OrderInfo order={order} />
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
