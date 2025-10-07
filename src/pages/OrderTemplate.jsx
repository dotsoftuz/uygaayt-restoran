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
import { Plus, FileText, Calendar, User } from 'lucide-react';

// Mock template data
const templates = [
  {
    id: 1,
    title: 'Restaurant Order Template',
    description:
      'Template for restaurant food orders with menu items and pricing',
    category: 'Food & Beverage',
    createdAt: '2024-01-15',
    author: 'Admin',
    fields: [
      'Customer Name',
      'Order Items',
      'Total Amount',
      'Delivery Address',
    ],
  },
  {
    id: 2,
    title: 'E-commerce Order Template',
    description:
      'Standard template for online store orders with product details',
    category: 'E-commerce',
    createdAt: '2024-01-20',
    author: 'Admin',
    fields: ['Product Name', 'Quantity', 'Price', 'Shipping Info'],
  },
  {
    id: 3,
    title: 'Service Order Template',
    description: 'Template for service-based orders like cleaning, maintenance',
    category: 'Services',
    createdAt: '2024-01-25',
    author: 'Admin',
    fields: ['Service Type', 'Duration', 'Location', 'Special Requirements'],
  },
  {
    id: 4,
    title: 'Custom Order Template',
    description: 'Flexible template for custom orders with multiple fields',
    category: 'Custom',
    createdAt: '2024-02-01',
    author: 'Admin',
    fields: ['Order Details', 'Custom Fields', 'Notes', 'Priority Level'],
  },
];

function OrderTemplate() {
  const navigate = useNavigate();

  const handleTemplateClick = (templateId) => {
    navigate(`/dashboard/template-detail/${templateId}`);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/create-template');
  };

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
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first order template to get started
          </p>
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderTemplate;
