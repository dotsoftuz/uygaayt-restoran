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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { useTemplates } from '@/hooks/use-templates';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function CreateOrder({ onSubmit }) {
  const [selectedTemplateServices, setSelectedTemplateServices] = useState([]);

  const defaultOrderData = {
    services: [
      selectedTemplateServices.map((service) => ({
        ...service,
        quantity: 1,
        date: new Date(),
        comment: service.comment,
        price: service.price,
        category: service.category,
        name: service.name,
        isWorking: service.isWorking,
      })),
    ],
    payments: [],
    comments: [],
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    clientId: '',
    clientName: '',
    clientPhone: '',
    weddingPlace: '',
    templateId: '',
    templatePrice: 0,
    contractPrice: 0,
    pledgingPrice: 0,
    remainingAmount: 0,
  };
  const [orderData, setOrderData] = useState(defaultOrderData);

  const { clients, addOrder } = useAppContext();
  const { templates, loading: templatesLoading } = useTemplates();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  const applyTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplateServices(template.services || []);
    setOrderData({
      ...orderData,
      services: template.services || [],
    });
  };
  console.log(orderData);

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

  const onFormSubmit = async (data) => {
    try {
      const orderData = {
        ...data,
        clientId: selectedClientId || null,
        clientName: data.mijozIsmi,
        clientPhone: data.telefon,
        templateId: selectedTemplateId,
        services: selectedTemplateServices.map((service) => ({
          ...service,
          quantity: 1,
          date: new Date(),
          comment: service.comment,
          price: service.price,
          category: service.category,
          name: service.name,
          isWorking: service.isWorking,
        })),
        totalAmount: orderData.contractPrice || 0,
        status: 'created',
        createdAt: new Date(),
      };

      // API orqali order yaratish
      const createdOrder = await createOrder(orderData);

      toast.success('Buyurtma muvaffaqiyatli yaratildi!');

      reset();
      setSelectedClientId('');
      setIsNewClient(false);
      setSelectedTemplateId('');
      setSelectedTemplateServices([]);

      if (onSubmit) {
        onSubmit(createdOrder);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(
        'Buyurtma yaratishda xatolik: ' + (error?.message || "Noma'lum xatolik")
      );
    }
  };

  return (
    <div className="my-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Ma'lumotlar</h3>
          <Card>
            <CardHeader>
              <span className="text-lg font-semibold text-foreground">
                Kameralar
              </span>
            </CardHeader>
            <CardContent>
              {orderData.services.filter(
                (service) => service.category === 'Kamera'
              ).length === 0 ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">Kamera xizmatlari mavjud emas</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.services
                    .filter((service) => service.category === 'Kamera')
                    .map((service, index) => (
                      <div key={service.id} className="group">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {service.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`quantity-${service.id}`}
                                className="text-xs font-medium text-gray-700"
                              >
                                Miqdor:
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`quantity-${service.id}`}
                                  type="number"
                                  min="1"
                                  value={service.quantity || ''}
                                  placeholder={service.quantity}
                                  onChange={(e) =>
                                    setOrderData({
                                      ...orderData,
                                      services: orderData.services.map((s) =>
                                        s.id === service.id
                                          ? {
                                              ...s,
                                              quantity:
                                                e.target.value === ''
                                                  ? ''
                                                  : parseInt(e.target.value) ||
                                                    1,
                                            }
                                          : s
                                      ),
                                    })
                                  }
                                  onBlur={(e) => {
                                    if (
                                      e.target.value === '' ||
                                      parseInt(e.target.value) < 1
                                    ) {
                                      setOrderData({
                                        ...orderData,
                                        services: orderData.services.map((s) =>
                                          s.id === service.id
                                            ? {
                                                ...s,
                                                quantity: 1,
                                              }
                                            : s
                                        ),
                                      });
                                    }
                                  }}
                                  className="w-16 h-7 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatNumber(
                                  (service.price || 0) * (service.quantity || 1)
                                )}{' '}
                                so'm
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                                className="h-8"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="py-2 border-r w-8">
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
