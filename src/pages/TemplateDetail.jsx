import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Edit,
  Copy,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';

function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, loading, error, deleteTemplate } = useTemplates();

  const template = templates.find((t) => t.id === id);

  if (loading) {
    return (
      <div className="space-y-6 my-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-gray-500">Shablon yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Xatolik yuz berdi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard/order-template')}>
            Shablonlar bo'limiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Shablon topilmadi
          </h3>
          <p className="text-gray-600 mb-4">Qidirilayotgan shablon topilmadi</p>
          <Button onClick={() => navigate('/dashboard/order-template')}>
            Shablonlar bo'limiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/dashboard/order-template');
  };

  const handleEdit = () => {
    navigate(`/dashboard/edit-template/${template.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bu shablonni o'chirishni xohlaysizmi?")) {
      try {
        await deleteTemplate(template.id);
        navigate('/dashboard/order-template');
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{template.title}</h1>
          <p className="text-gray-600 mt-1">{template.description}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Tahrirlash
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            O'chirish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Shablon ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Xizmatlar soni
                </label>
                <p className="text-sm text-gray-900 bg-blue-100 px-2 py-1 rounded mt-1 inline-block">
                  {template.services?.length || 0} ta xizmat
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Render variantlari
                </label>
                <p className="text-sm text-gray-900 bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                  {template.render?.length || 0} ta variant
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Qo'shimcha xizmatlar
                </label>
                <p className="text-sm text-gray-900 bg-purple-100 px-2 py-1 rounded mt-1 inline-block">
                  {template.additionalServices?.length || 0} ta xizmat
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Yaratilgan
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {template.createdAt
                      ? new Date(
                          template.createdAt.seconds * 1000
                        ).toLocaleDateString('uz-UZ')
                      : "Noma'lum"}
                  </span>
                </div>
              </div>
              {template.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Yangilangan
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {new Date(
                        template.updatedAt.seconds * 1000
                      ).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Structure */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shablon tuzilmasi</CardTitle>
              <CardDescription>
                Bu shablon {template.services?.length || 0} ta xizmat,{' '}
                {template.render?.length || 0} ta render variant va{' '}
                {template.additionalServices?.length || 0} ta qo'shimcha
                xizmatni o'z ichiga oladi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Services Section */}
                {template.services && template.services.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tanlangan xizmatlar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.services.map((service, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                              {service.name}
                            </label>
                            <span className="text-sm text-gray-500">
                              {service.price?.toLocaleString('uz-UZ')} so'm
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {service.category || "Kategoriya yo'q"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Options Section */}
                {template.render && template.render.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Render variantlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.render.map((render, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {render}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Render variant
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Services Section */}
                {template.additionalServices &&
                  template.additionalServices.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Qo'shimcha xizmatlar
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {template.additionalServices.map((service, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                {service}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                Qo'shimcha xizmat
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;
