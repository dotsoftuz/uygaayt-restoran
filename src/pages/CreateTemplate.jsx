import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Loader2, FileText } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { useTemplates } from '@/hooks/use-templates';
import { Label } from '@/components/ui/label';

function CreateTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copyFromId = searchParams.get('copy');
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices();
  const { addTemplate, templates } = useTemplates();

  const [template, setTemplate] = useState({
    title: '',
    description: '',
    selectedServices: [],
    imageQuality: {
      capture4k: false,
      render4kFullHD: false,
      capture4kRenderFullHD: false,
    },
    additionalServices: {
      live: false,
      flash: false,
      album: false,
      customAdditions: [],
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (copyFromId && templates.length > 0) {
      const templateToCopy = templates.find((t) => t.id === copyFromId);
      if (templateToCopy) {
        const selectedServiceIds =
          templateToCopy.services?.map((s) => s.id) || [];

        const imageQuality = {
          capture4k:
            templateToCopy.render?.includes('4K tasvirga olish') || false,
          render4kFullHD:
            templateToCopy.render?.includes('4K + FullHD render') || false,
          capture4kRenderFullHD:
            templateToCopy.render?.includes(
              '4K tasvirga olish, FullHD render'
            ) || false,
        };

        const additionalServices = {
          live: templateToCopy.additionalServices?.includes('Live') || false,
          flash: templateToCopy.additionalServices?.includes('Flash') || false,
          album: templateToCopy.additionalServices?.includes('Albom') || false,
          customAdditions:
            templateToCopy.additionalServices?.filter(
              (s) => !['Live', 'Flash', 'Albom'].includes(s)
            ) || [],
        };

        setTemplate({
          title: `${templateToCopy.title} (nusxa)`,
          description: templateToCopy.description || '',
          selectedServices: selectedServiceIds,
          imageQuality,
          additionalServices,
        });
      }
    }
  }, [copyFromId, templates]);

  const activeServices = services.filter(
    (service) => service.status === 'active'
  );

  const servicesByCategory = activeServices.reduce((acc, service) => {
    const category = service.category || 'Boshqa';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  const categories = Object.keys(servicesByCategory);

  const handleBack = () => {
    navigate('/dashboard/order-template');
  };

  const handleSave = async () => {
    if (!template.title.trim()) {
      alert('Shablon nomi majburiy!');
      return;
    }
    if (template.selectedServices.length === 0) {
      alert('Kamida bitta xizmat tanlashingiz kerak!');
      return;
    }

    setIsSaving(true);
    try {
      const selectedServicesData = template.selectedServices.map(
        (serviceId) => {
          const service = activeServices.find((s) => s.id === serviceId);
          return {
            id: service.id,
            name: service.name,
            price: service.price,
            category: service.category,
            quantity: 1,
            date: service.date,
            isWorking: service.isWorking,
            comment: service.comment,
          };
        }
      );

      const renderOptions = [];
      if (template.imageQuality.capture4k) {
        renderOptions.push('4K tasvirga olish');
      }
      if (template.imageQuality.render4kFullHD) {
        renderOptions.push('4K + FullHD render');
      }
      if (template.imageQuality.capture4kRenderFullHD) {
        renderOptions.push('4K tasvirga olish, FullHD render');
      }

      const additionalServices = [];
      if (template.additionalServices.live) {
        additionalServices.push('Live');
      }
      if (template.additionalServices.flash) {
        additionalServices.push('Flash');
      }
      if (template.additionalServices.album) {
        additionalServices.push('Albom');
      }
      additionalServices.push(
        ...template.additionalServices.customAdditions.filter((item) =>
          item.trim()
        )
      );

      const templateData = {
        title: template.title,
        description: template.description,
        services: selectedServicesData,
        render: renderOptions,
        additionalServices: additionalServices,
      };

      await addTemplate(templateData);
      navigate('/dashboard/order-template');
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplate = (field, value) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setTemplate((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const handleImageQualityToggle = (quality) => {
    setTemplate((prev) => ({
      ...prev,
      imageQuality: {
        ...prev.imageQuality,
        [quality]: !prev.imageQuality[quality],
      },
    }));
  };

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Shablon yaratish
          </h2>
          <p className="text-muted-foreground">
            Shablon yaratish uchun, kerakli hizmatlarni tanlab "Saqlash"
            tugmasini bosing.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              Saqlash
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {template.selectedServices.length > 0 && (
          <div className="sticky top-2 lg:top-4 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm lg:text-base font-semibold text-blue-900">
                Tanlangan xizmatlar umumiy narxi:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {template.selectedServices
                  .reduce((total, serviceId) => {
                    const service = activeServices.find(
                      (s) => s.id === serviceId
                    );
                    return total + (service ? service.price : 0);
                  }, 0)
                  .toLocaleString('uz-UZ')}{' '}
                so'm
              </span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {template.selectedServices.length} ta xizmat tanlandi
            </div>
          </div>
        )}
        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Shablon ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  required
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Shablon nomi
                </Label>
                <Input
                  value={template.title}
                  onChange={(e) => updateTemplate('title', e.target.value)}
                  placeholder="Shablon nomini kiriting"
                  required
                />
              </div>
              <div>
                <Label
                  optional
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Tafsilot
                </Label>
                <Textarea
                  value={template.description}
                  onChange={(e) =>
                    updateTemplate('description', e.target.value)
                  }
                  placeholder="Shablon haqida tafsilot"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services Selection by Category */}
          {servicesLoading ? (
            <Card>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">
                    Xizmatlar yuklanmoqda...
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : servicesError ? (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-2">
                    Xatolik: {servicesError}
                  </p>
                  <p className="text-xs text-gray-500">Xizmatlar yuklanmadi</p>
                </div>
              </CardContent>
            </Card>
          ) : activeServices.length === 0 ? (
            <Card className="h-auto">
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-2">
                    Hech qanday faol xizmat yo'q
                  </p>
                  <p className="text-xs text-gray-400">
                    Avval xizmatlar bo'limida xizmat qo'shing
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-auto">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {categories.map((category, index) => (
                    <div key={category}>
                      <div className="flex items-center space-x-2 mb-4">
                        <h3 className="text-lg font-semibold">{category}</h3>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      <div className="space-y-3">
                        {servicesByCategory[category].map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={template.selectedServices.includes(
                                service.id
                              )}
                              onCheckedChange={() =>
                                handleServiceToggle(service.id)
                              }
                            />
                            <label
                              htmlFor={`service-${service.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                            >
                              <div className="flex justify-between items-center">
                                <span>{service.name}</span>
                                <span className="text-gray-500">
                                  {service.price.toLocaleString('uz-UZ')} so'm
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                      {index < categories.length - 1 && (
                        <div className="mt-6 h-px bg-gray-100"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateTemplate;
