import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Layers,
  Image,
} from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';
import { formatDate } from '@/lib/utils';

function OrderTemplate() {
  const navigate = useNavigate();
  const { templates, loading, error } = useTemplates();

  const handleTemplateClick = (templateId) => {
    navigate(`/dashboard/template-detail/${templateId}`);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/create-template');
  };
  console.log(templates[0]);

  return (
    <div className="space-y-6 my-4">
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
          size="sm"
          onClick={handleCreateNew}
          className="flex items-center gap-2"
        >
          Yangi shablon
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-gray-500">Shablonlar yuklanmoqda...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Xatolik yuz berdi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {template.services?.length > 0 && (
                      <span className="px-2 py-[2px] text-xs rounded-full shadow-sm bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {template.services.length} ta xizmat
                      </span>
                    )}

                    {template.additionalServices?.length > 0 && (
                      <span className="px-2 py-[2px] text-xs rounded-full shadow-sm bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
                        <Image className="h-3.5 w-3.5" />+
                        {template.additionalServices.length} qo‘shimcha
                      </span>
                    )}
                  </div>

                  {template.createdAt?.seconds && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(template.createdAt.seconds)}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold leading-tight">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {template.description || 'Tafsilot mavjud emas'}
                  </p>

                  {template.services?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {template.services.slice(0, 4).map((service, index) => (
                        <span
                          key={index}
                          className="text-[13px] px-2 py-[2px] rounded-full bg-white border border-border shadow-sm"
                        >
                          {service.category}: {service.name}
                        </span>
                      ))}
                      {template.services.length > 4 && (
                        <span className="text-[13px] px-2 py-[2px] rounded-full bg-white border border-border shadow-sm">
                          +{template.services.length - 4} ta
                        </span>
                      )}
                    </div>
                  )}

                  {template.render?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {template.render.slice(0, 2).map((item, index) => (
                        <span
                          key={index}
                          className="text-[13px] px-2 py-[2px] rounded-full bg-green-50 text-green-700 border border-green-100 shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                      {template.render.length > 2 && (
                        <span className="text-[13px] px-2 py-[2px] rounded-full bg-white border border-border shadow-sm">
                          +{template.render.length - 2} ta render
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleTemplateClick(template.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ko‘rish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  {false ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Hali shablon yo'q
          </h3>
          <p className="text-gray-600 mb-4">
            Birinchi buyurtma shablonini yaratish uchun boshlang
          </p>
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Shablon yaratish
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderTemplate;
