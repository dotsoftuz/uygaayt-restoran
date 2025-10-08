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
import { Plus, FileText, Loader2 } from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';

function OrderTemplate() {
  const navigate = useNavigate();
  const { templates, loading, error } = useTemplates();

  const handleTemplateClick = (templateId) => {
    navigate(`/dashboard/template-detail/${templateId}`);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/create-template');
  };
  console.log(templates);
  

  return (
    <div className="space-y-6 my-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Buyurtma shablonlar
          </h1>
          <p className="text-gray-600 mt-2">
            Buyurtma shablonlarini boshqarish va tayyorlash
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 transform"
              onClick={() => handleTemplateClick(template.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {template.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description || "Tafsilot yo'q"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Xizmatlar:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.services?.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {service.name}
                        </span>
                      ))}
                      {template.services?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.services.length - 3} ta
                        </span>
                      )}
                    </div>
                  </div>
                  {template.render && template.render.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Render:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.render.slice(0, 2).map((render, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                          >
                            {render}
                          </span>
                        ))}
                        {template.render.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{template.render.length - 2} ta
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {template.additionalServices &&
                    template.additionalServices.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Qo'shimcha:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.additionalServices
                            .slice(0, 2)
                            .map((service, index) => (
                              <span
                                key={index}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          {template.additionalServices.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{template.additionalServices.length - 2} ta
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
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
