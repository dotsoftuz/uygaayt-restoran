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
import { ArrowLeft, Save, Plus, Loader2 } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { useTemplates } from '@/hooks/use-templates';

function CreateTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copyFromId = searchParams.get('copy');
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices();
  const { addTemplate } = useTemplates();

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

  // Filter only active services and group by category
  const activeServices = services.filter(
    (service) => service.status === 'active'
  );

  // Group services by category
  const servicesByCategory = activeServices.reduce((acc, service) => {
    const category = service.category || 'Boshqa';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  // Get unique categories
  const categories = Object.keys(servicesByCategory);

  const handleBack = () => {
    navigate('/dashboard/order-template');
  };

  const handleSave = async () => {
    // Validate required fields
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
      // Get selected services with their details
      const selectedServicesData = template.selectedServices.map(
        (serviceId) => {
          const service = activeServices.find((s) => s.id === serviceId);
          return {
            id: service.id,
            name: service.name,
            price: service.price,
            category: service.category,
          };
        }
      );

      // Prepare render options array
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

      // Prepare additional services
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
      // Add custom additions
      additionalServices.push(
        ...template.additionalServices.customAdditions.filter((item) =>
          item.trim()
        )
      );

      // Prepare template data for Firestore
      const templateData = {
        title: template.title,
        description: template.description,
        xizmatlar: selectedServicesData, // Services array with id, name, price
        render: renderOptions, // Image quality options
        qoshimchalar: additionalServices, // Additional services
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
    <div className="space-y-6 my-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {copyFromId ? 'Shablonni nusxalash' : 'Yangi shablon yaratish'}
          </h1>
          <p className="text-gray-600 mt-1">
            {copyFromId
              ? 'Mavjud shablon asosida yangi shablon yaratish'
              : 'Buyurtma shablonini dizayn qilish'}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Saqlash
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Asosiy ma'lumotlar</CardTitle>
              <CardDescription>Shablonning asosiy ma'lumotlari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Shablon nomi *
                </label>
                <Input
                  value={template.title}
                  onChange={(e) => updateTemplate('title', e.target.value)}
                  placeholder="Shablon nomini kiriting"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tafsilot
                </label>
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
            <Card>
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
            categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {category} kategoriyasidagi xizmatlar
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Image Quality Options */}
        <Card>
          <CardHeader>
            <CardTitle>Tasvir va render sifati</CardTitle>
            <CardDescription>
              Tasvirga olish va render sifati tanlang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="capture4k"
                  checked={template.imageQuality.capture4k}
                  onCheckedChange={() => handleImageQualityToggle('capture4k')}
                />
                <label
                  htmlFor="capture4k"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  4K tasvirga olish
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="render4kFullHD"
                  checked={template.imageQuality.render4kFullHD}
                  onCheckedChange={() =>
                    handleImageQualityToggle('render4kFullHD')
                  }
                />
                <label
                  htmlFor="render4kFullHD"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  4K + FullHD render
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="capture4kRenderFullHD"
                  checked={template.imageQuality.capture4kRenderFullHD}
                  onCheckedChange={() =>
                    handleImageQualityToggle('capture4kRenderFullHD')
                  }
                />
                <label
                  htmlFor="capture4kRenderFullHD"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  4K tasvirga olish, FullHD render
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateTemplate;
