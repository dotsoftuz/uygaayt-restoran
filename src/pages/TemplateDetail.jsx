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
} from 'lucide-react';

// Mock template data (same as in OrderTemplate.jsx)
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
    content: {
      sections: [
        {
          title: 'Customer Information',
          fields: [
            { name: 'Customer Name', type: 'text', required: true },
            { name: 'Phone Number', type: 'tel', required: true },
            { name: 'Email', type: 'email', required: false },
          ],
        },
        {
          title: 'Order Details',
          fields: [
            { name: 'Order Items', type: 'textarea', required: true },
            { name: 'Special Instructions', type: 'textarea', required: false },
            { name: 'Total Amount', type: 'number', required: true },
          ],
        },
        {
          title: 'Delivery Information',
          fields: [
            { name: 'Delivery Address', type: 'textarea', required: true },
            { name: 'Delivery Time', type: 'datetime-local', required: true },
            {
              name: 'Payment Method',
              type: 'select',
              required: true,
              options: ['Cash', 'Card', 'Online'],
            },
          ],
        },
      ],
    },
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
    content: {
      sections: [
        {
          title: 'Product Information',
          fields: [
            { name: 'Product Name', type: 'text', required: true },
            { name: 'Product SKU', type: 'text', required: true },
            { name: 'Quantity', type: 'number', required: true },
            { name: 'Price', type: 'number', required: true },
          ],
        },
        {
          title: 'Customer Details',
          fields: [
            { name: 'Customer Name', type: 'text', required: true },
            { name: 'Email', type: 'email', required: true },
            { name: 'Phone', type: 'tel', required: false },
          ],
        },
        {
          title: 'Shipping Information',
          fields: [
            { name: 'Shipping Address', type: 'textarea', required: true },
            {
              name: 'Shipping Method',
              type: 'select',
              required: true,
              options: ['Standard', 'Express', 'Overnight'],
            },
            { name: 'Tracking Number', type: 'text', required: false },
          ],
        },
      ],
    },
  },
  {
    id: 3,
    title: 'Service Order Template',
    description: 'Template for service-based orders like cleaning, maintenance',
    category: 'Services',
    createdAt: '2024-01-25',
    author: 'Admin',
    fields: ['Service Type', 'Duration', 'Location', 'Special Requirements'],
    content: {
      sections: [
        {
          title: 'Service Information',
          fields: [
            {
              name: 'Service Type',
              type: 'select',
              required: true,
              options: ['Cleaning', 'Maintenance', 'Repair', 'Installation'],
            },
            { name: 'Service Description', type: 'textarea', required: true },
            { name: 'Duration (hours)', type: 'number', required: true },
          ],
        },
        {
          title: 'Location & Timing',
          fields: [
            { name: 'Location', type: 'textarea', required: true },
            { name: 'Preferred Date', type: 'date', required: true },
            { name: 'Preferred Time', type: 'time', required: true },
          ],
        },
        {
          title: 'Special Requirements',
          fields: [
            { name: 'Special Requirements', type: 'textarea', required: false },
            { name: 'Access Instructions', type: 'textarea', required: false },
            { name: 'Contact Person', type: 'text', required: true },
          ],
        },
      ],
    },
  },
  {
    id: 4,
    title: 'Custom Order Template',
    description: 'Flexible template for custom orders with multiple fields',
    category: 'Custom',
    createdAt: '2024-02-01',
    author: 'Admin',
    fields: ['Order Details', 'Custom Fields', 'Notes', 'Priority Level'],
    content: {
      sections: [
        {
          title: 'Order Information',
          fields: [
            { name: 'Order Details', type: 'textarea', required: true },
            {
              name: 'Priority Level',
              type: 'select',
              required: true,
              options: ['Low', 'Medium', 'High', 'Urgent'],
            },
            { name: 'Expected Completion', type: 'date', required: false },
          ],
        },
        {
          title: 'Custom Fields',
          fields: [
            { name: 'Custom Field 1', type: 'text', required: false },
            { name: 'Custom Field 2', type: 'text', required: false },
            { name: 'Custom Field 3', type: 'text', required: false },
          ],
        },
        {
          title: 'Additional Information',
          fields: [
            { name: 'Notes', type: 'textarea', required: false },
            { name: 'Attachments', type: 'file', required: false },
            { name: 'Budget Range', type: 'text', required: false },
          ],
        },
      ],
    },
  },
];

function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const template = templates.find((t) => t.id === parseInt(id));

  if (!template) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Shablon topilmadi   
          </h3>
          <p className="text-gray-600 mb-4">
            Qidirilayotgan shablon topilmadi
          </p>
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

  const handleCopy = () => {
    // Navigate to create template with this template as base
    navigate(`/dashboard/create-template?copy=${template.id}`);
  };

  const handlePreview = () => {
    // Open template preview in a modal or new page
    console.log('Preview template:', template.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      // Handle delete logic here
      console.log('Delete template:', template.id);
      navigate('/dashboard/order-template');
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
          <Button
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ko'rish
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Nusxalash
          </Button>
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
                  Tur
                </label>
                <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {template.category}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Muallif
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {template.author}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Yaratilgan
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Maydonlar soni
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {template.fields.length} fields
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Structure */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shablon tuzilmasi</CardTitle>
              <CardDescription>
                Bu shablon {template.content.sections.length} bo'lim va
                shakllangan maydonlarni o'z ichiga oladi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {template.content.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              {field.name}
                            </label>
                            {field.required && (
                              <span className="text-red-500 text-xs">*</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {field.type}
                            </span>
                            {field.options && (
                              <span className="text-xs text-gray-500">
                                {field.options.length} options
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;
