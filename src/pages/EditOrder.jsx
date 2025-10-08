import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller, useForm } from 'react-hook-form';
import { useAppContext } from '@/context/AppContext';
import { useTemplates } from '@/hooks/use-templates';
import { useServices } from '@/hooks/use-services';
import { useOrders } from '@/hooks/use-orders';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clients, orders } = useAppContext();
  const { editOrder } = useOrders();
  const { templates, loading: templatesLoading } = useTemplates();
  const { services } = useServices();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formattedPrice, setFormattedPrice] = useState('');
  const [loading, setLoading] = useState(true);

  // Find the order to edit
  const order = orders.find((o) => o.id === orderId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      toyxona: '',
      nikoh: '',
      bazm: '',
      sana: '',
      kameraSoni: 1,
      telefon: '',
      mijozIsmi: '',
      clientId: '',
      options: {
        nikoh: false,
        fotosessiya: false,
        bazm: false,
        chimilidq: false,
        elOshi: false,
        fotixaTuy: false,
        kelinSalom: false,
        qizBazm: false,
        loveStory: false,
      },
      albom: 'A4',
      fleshka: false,
      pramoyEfir: false,
      operatorlar: {
        opr1: '',
        opr2: '',
        ronin: '',
        kran: '',
        camera360: '',
      },
      qoshimcha: {
        foto: '',
        nahor: '',
        kelinSalom: '',
        pramoyEfir: '',
        montaj: '',
      },
      narx: 0,
    },
  });

  // Load order data when component mounts
  useEffect(() => {
    if (order) {
      // Populate form with existing order data
      reset({
        toyxona: order.toyxona || '',
        nikoh: order.nikoh || '',
        bazm: order.bazm || '',
        sana: order.sana || '',
        kameraSoni: order.kameraSoni || 1,
        telefon: order.telefon || '',
        mijozIsmi: order.mijozIsmi || '',
        clientId: order.clientId || '',
        options: order.options || {
          nikoh: false,
          fotosessiya: false,
          bazm: false,
          chimilidq: false,
          elOshi: false,
          fotixaTuy: false,
          kelinSalom: false,
          qizBazm: false,
          loveStory: false,
        },
        albom: order.albom || 'A4',
        fleshka: order.fleshka || false,
        pramoyEfir: order.pramoyEfir || false,
        operatorlar: order.operatorlar || {
          opr1: '',
          opr2: '',
          ronin: '',
          kran: '',
          camera360: '',
        },
        qoshimcha: order.qoshimcha || {
          foto: '',
          nahor: '',
          kelinSalom: '',
          pramoyEfir: '',
          montaj: '',
        },
        narx: order.narx || 0,
      });

      // Set client selection state
      if (order.clientId) {
        setSelectedClientId(order.clientId);
        setIsNewClient(false);
      } else {
        setIsNewClient(true);
      }

      setLoading(false);
    }
  }, [order, reset]);

  // Format number with spaces for better readability
  const formatNumber = (num) => {
    return (
      num
        ?.toLocaleString('uz-UZ', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/,/g, ' ') || '0'
    );
  };

  // Handle price input formatting
  const handlePriceChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    setValue('narx', parseInt(numericValue) || 0);
    setFormattedPrice(formatNumber(parseInt(numericValue) || 0));
  };

  // Apply template data to form
  const applyTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const templateServices = template.services || [];
    const options = {};

    templateServices.forEach((service) => {
      const serviceName = service.name.toLowerCase();
      if (serviceName.includes('nikoh')) options.nikoh = true;
      if (serviceName.includes('fotosessiya')) options.fotosessiya = true;
      if (serviceName.includes('bazm')) options.bazm = true;
      if (serviceName.includes('chimilidq')) options.chimilidq = true;
      if (serviceName.includes('el oshi')) options.elOshi = true;
      if (serviceName.includes('fotixa tuy')) options.fotixaTuy = true;
      if (serviceName.includes('kelin salom')) options.kelinSalom = true;
      if (serviceName.includes('qiz bazm')) options.qizBazm = true;
      if (serviceName.includes('love story')) options.loveStory = true;
    });

    const additionalServices = template.additionalServices || [];
    const fleshka = additionalServices.includes('Flash');
    const pramoyEfir = additionalServices.includes('Live');

    setValue('options', options);
    setValue('fleshka', fleshka);
    setValue('pramoyEfir', pramoyEfir);
    setFormattedPrice(formatNumber(0));
  };

  // Calculate total price based on selected services
  const calculatePrice = useCallback(
    (options = {}, fleshka = false, pramoyEfir = false) => {
      let totalPrice = 0;

      const servicePrices = {
        nikoh: 500000,
        fotosessiya: 300000,
        bazm: 400000,
        chimilidq: 200000,
        elOshi: 150000,
        fotixaTuy: 250000,
        kelinSalom: 100000,
        qizBazm: 350000,
        loveStory: 200000,
      };

      Object.entries(options).forEach(([service, isSelected]) => {
        if (isSelected && servicePrices[service]) {
          totalPrice += servicePrices[service];
        }
      });

      if (fleshka) totalPrice += 50000;
      if (pramoyEfir) totalPrice += 100000;

      setValue('narx', totalPrice);
      setFormattedPrice(formatNumber(totalPrice));
    },
    [setValue, formatNumber]
  );

  // Watch form changes and recalculate price
  const watchedOptions = watch('options');
  const watchedFleshka = watch('fleshka');
  const watchedPramoyEfir = watch('pramoyEfir');
  const watchedNarx = watch('narx');

  useEffect(() => {
    if (watchedOptions) {
      calculatePrice(watchedOptions, watchedFleshka, watchedPramoyEfir);
    }
  }, [watchedOptions, watchedFleshka, watchedPramoyEfir]);

  useEffect(() => {
    if (watchedNarx !== undefined) {
      setFormattedPrice(formatNumber(watchedNarx));
    }
  }, [watchedNarx]);

  const onFormSubmit = async (data) => {
    try {
      const orderData = {
        ...data,
        clientId: selectedClientId || null,
        clientName: data.mijozIsmi,
        clientPhone: data.telefon,
      };

      await editOrder(orderId, orderData);
      navigate('/dashboard/orders');
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Buyurtma yuklanmoqda...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Buyurtma topilmadi
        </h3>
        <p className="text-gray-600 mb-4">
          Bu buyurtma mavjud emas yoki o'chirilgan
        </p>
        <Button onClick={() => navigate('/dashboard/orders')}>
          Buyurtmalar ro'yxatiga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Buyurtmani tahrirlash
          </h1>
          <p className="text-gray-600 mt-1">
            {order.mijozIsmi} - {order.toyxona}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Client Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Mijoz tanlash
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={!isNewClient ? 'default' : 'outline'}
                onClick={() => {
                  setIsNewClient(false);
                  setSelectedClientId('');
                }}
              >
                Mavjud mijoz
              </Button>
              <Button
                type="button"
                variant={isNewClient ? 'default' : 'outline'}
                onClick={() => {
                  setIsNewClient(true);
                  setSelectedClientId('');
                }}
              >
                Yangi mijoz
              </Button>
            </div>

            {!isNewClient && (
              <div className="space-y-2">
                <Label htmlFor="clientSelect">Mijozni tanlang</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={selectedClientId}
                      onValueChange={(value) => {
                        setSelectedClientId(value);
                        field.onChange(value);
                        const selectedClient = clients.find(
                          (c) => c.id === value
                        );
                        if (selectedClient) {
                          setValue('mijozIsmi', selectedClient.name);
                          setValue('telefon', selectedClient.phone);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mijozni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Shablon tanlash (ixtiyoriy)
          </h3>
          <div className="space-y-2">
            <Label htmlFor="templateSelect">Shablonni tanlang</Label>
            <Controller
              name="templateId"
              control={control}
              render={({ field }) => (
                <Select
                  value={selectedTemplateId}
                  onValueChange={(value) => {
                    setSelectedTemplateId(value);
                    field.onChange(value);
                    if (
                      value &&
                      value !== 'loading' &&
                      value !== 'no-templates'
                    ) {
                      applyTemplate(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Shablonni tanlang (ixtiyoriy)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesLoading ? (
                      <SelectItem value="loading" disabled>
                        Shablonlar yuklanmoqda...
                      </SelectItem>
                    ) : templates.length === 0 ? (
                      <SelectItem value="no-templates" disabled>
                        Hech qanday shablon yo'q
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {selectedTemplateId &&
              selectedTemplateId !== 'loading' &&
              selectedTemplateId !== 'no-templates' && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    Shablon ma'lumotlari avtomatik to'ldirildi
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Kerakli maydonlarni qo'lda tahrirlashingiz mumkin
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Asosiy ma'lumotlar
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mijozIsmi">Mijoz ismi</Label>
              <Input
                id="mijozIsmi"
                {...register('mijozIsmi', {
                  required: 'Mijoz ismi majburiy',
                })}
                placeholder="Mijoz ismini kiriting"
                disabled={!isNewClient && selectedClientId}
              />
              {errors.mijozIsmi && (
                <p className="text-sm text-red-500">
                  {errors.mijozIsmi.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                {...register('telefon', {
                  required: 'Telefon raqami majburiy',
                })}
                placeholder="+998 90 123 45 67"
                disabled={!isNewClient && selectedClientId}
              />
              {errors.telefon && (
                <p className="text-sm text-red-500">{errors.telefon.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="toyxona">To'yxona</Label>
              <Input
                id="toyxona"
                {...register('toyxona', {
                  required: "To'yxona nomi majburiy",
                })}
                placeholder="To'yxona nomini kiriting"
              />
              {errors.toyxona && (
                <p className="text-sm text-red-500">{errors.toyxona.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nikoh">Nikoh</Label>
              <Input
                id="nikoh"
                {...register('nikoh')}
                placeholder="Nikoh joyini kiriting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bazm">Bazm</Label>
              <Input
                id="bazm"
                {...register('bazm')}
                placeholder="Bazm joyini kiriting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sana">Sana</Label>
              <Controller
                name="sana"
                control={control}
                rules={{ required: 'Sana majburiy' }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full"
                  />
                )}
              />
              {errors.sana && (
                <p className="text-sm text-red-500">{errors.sana.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kameraSoni">Kamera soni</Label>
              <Input
                id="kameraSoni"
                type="number"
                min="1"
                {...register('kameraSoni', {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Xizmatlar</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'nikoh', label: 'Nikoh' },
              { id: 'fotosessiya', label: 'Fotosessiya' },
              { id: 'bazm', label: 'Bazm' },
              { id: 'chimilidq', label: 'Chimilidq' },
              { id: 'elOshi', label: 'El oshi' },
              { id: 'fotixaTuy', label: 'Fotixa tuy' },
              { id: 'kelinSalom', label: 'Kelin salom' },
              { id: 'qizBazm', label: 'Qiz bazm' },
              { id: 'loveStory', label: 'Love Story' },
            ].map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Controller
                  name={`options.${option.id}`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option.id}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Album Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Albom tanlash
          </h3>
          <Controller
            name="albom"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex gap-4"
              >
                {['A4', '30x30', 'A3'].map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={size} />
                    <Label
                      htmlFor={size}
                      className="cursor-pointer font-normal"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Qo'shimcha</h3>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Controller
                name="fleshka"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="fleshka"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="fleshka" className="cursor-pointer font-normal">
                Fleshkaga yozish
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="pramoyEfir"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="pramoyEfir"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="pramoyEfir"
                className="cursor-pointer font-normal"
              >
                Pramoy efir
              </Label>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="narx">Narx (so'm)</Label>
            <Input
              id="narx"
              type="text"
              value={formattedPrice}
              onChange={handlePriceChange}
              placeholder="Narx avtomatik hisoblanadi"
              className="text-left"
            />
            <p className="text-sm text-blue-600 font-medium">
              💡 Narx avtomatik hisoblanadi, lekin qo'lda o'zgartirish mumkin
            </p>
            <p className="text-xs text-gray-500">
              Xizmatlar tanlanganda narx avtomatik yangilanadi
            </p>
            {watchedNarx && watchedNarx > 0 && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                  Jami: {formatNumber(watchedNarx)} so'm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Buyurtmani yangilash
          </Button>
        </div>
      </form>
    </div>
  );
}
