'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Controller, useForm } from 'react-hook-form';
import { useAppContext } from '@/context/AppContext';
import { useTemplates } from '@/hooks/use-templates';
import { useServices } from '@/hooks/use-services';
import { useState, useEffect, useCallback } from 'react';

export default function CreateOrder({ onSubmit }) {
  const { clients, addOrder } = useAppContext();
  const { templates, loading: templatesLoading } = useTemplates();
  const { services } = useServices();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formattedPrice, setFormattedPrice] = useState('');
  const [selectedTemplateServices, setSelectedTemplateServices] = useState([]);

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

  // Apply template data to form
  const applyTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Set selected template services for table display
    setSelectedTemplateServices(template.services || []);

    // Apply services from template
    const templateServices = template.services || [];
    const options = {};

    // Map template services to form options
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

    // Apply additional services
    const additionalServices = template.additionalServices || [];
    const fleshka = additionalServices.includes('Flash');
    const pramoyEfir = additionalServices.includes('Live');

    // Update form values
    setValue('options', options);
    setValue('fleshka', fleshka);
    setValue('pramoyEfir', pramoyEfir);

    // Calculate and set price
    calculatePrice(options, fleshka, pramoyEfir);
  };

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

  // Calculate total price based on selected services
  const calculatePrice = useCallback(
    (options = {}, fleshka = false, pramoyEfir = false) => {
      let totalPrice = 0;

      // Base prices for services (you can adjust these values)
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

      // Add prices for selected services
      Object.entries(options).forEach(([service, isSelected]) => {
        if (isSelected && servicePrices[service]) {
          totalPrice += servicePrices[service];
        }
      });

      // Add prices for additional services
      if (fleshka) totalPrice += 50000; // Flash drive
      if (pramoyEfir) totalPrice += 100000; // Live streaming

      // Set the calculated price
      setValue('narx', totalPrice);
      setFormattedPrice(formatNumber(totalPrice));
    },
    [setValue, formatNumber]
  );

  // Handle price input formatting
  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    // Update the actual form value
    setValue('narx', parseInt(numericValue) || 0);
    // Update the formatted display
    setFormattedPrice(formatNumber(parseInt(numericValue) || 0));
  };

  // Watch form changes and recalculate price
  const watchedOptions = watch('options');
  const watchedFleshka = watch('fleshka');
  const watchedPramoyEfir = watch('pramoyEfir');
  const watchedNarx = watch('narx');

  useEffect(() => {
    if (watchedOptions !== undefined) {
      calculatePrice(watchedOptions, watchedFleshka, watchedPramoyEfir);
    }
  }, [watchedOptions, watchedFleshka, watchedPramoyEfir]);

  // Update formatted price when narx changes
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

      await addOrder(orderData);
      reset();
      setSelectedClientId('');
      setIsNewClient(false);
      setSelectedTemplateId('');

      if (onSubmit) {
        onSubmit(orderData);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="my-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Shablonni tanlang</Label>
            <Controller
              name="templateId"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  {templatesLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-gray-500">Shablonlar yuklanmoqda...</p>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-gray-500">Hech qanday shablon yo'q</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedTemplateId === template.id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            field.onChange(template.id);
                            applyTemplate(template.id);
                          }}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              {template.title}
                            </CardTitle>
                            {template.description && (
                              <CardDescription>
                                {template.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            {template.services &&
                              template.services.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    Xizmatlar:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {template.services
                                      .slice(0, 3)
                                      .map((service, index) => (
                                        <span
                                          key={index}
                                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                        >
                                          {service.name}
                                        </span>
                                      ))}
                                    {template.services.length > 3 && (
                                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                        +{template.services.length - 3} boshqa
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Ma'lumotlar</h3>
          <div className="grid gap-4 md:grid-cols-2">
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

            <div>Shu sanadagi buyurtmalar</div>
          </div>
        </div>

        {/* Services Table - Only show after template selection */}
        {selectedTemplateId &&
          selectedTemplateId !== 'loading' &&
          selectedTemplateId !== 'no-templates' &&
          selectedTemplateServices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Xizmatlar
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Tanlash</TableHead>
                      <TableHead className="w-12">Xizmat nomi</TableHead>
                      <TableHead className="w-6">Sana</TableHead>
                      <TableHead className="w-60">
                        Qo'shimcha ma'lumot
                      </TableHead>
                      <TableHead className="w-32">Narx</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTemplateServices.map((service, index) => (
                      <TableRow key={index} className="h-12">
                        <TableCell className="py-2 border-r">
                          <Controller
                            name={`templateServices.${index}.selected`}
                            control={control}
                            defaultValue={true}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium py-2 border-r">
                          {service.name}
                        </TableCell>
                        <TableCell className="py-2 border-r">
                          <Controller
                            name={`templateServices.${index}.date`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                className="w-8 h-8"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="py-2 border-r">
                          <Controller
                            name={`templateServices.${index}.notes`}
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                placeholder="Qo'shimcha ma'lumot..."
                                className="min-h-[32px] h-8 resize-none"
                                {...field}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Controller
                            name={`templateServices.${index}.price`}
                            control={control}
                            defaultValue={service.price || 0}
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="Narx"
                                className="h-8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Buyurtmani saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}
