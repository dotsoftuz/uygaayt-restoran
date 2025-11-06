import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// CSV Template structure
const CSV_TEMPLATE_HEADERS = [
  'name',
  'sku',
  'category',
  'price',
  'oldPrice',
  'stockQty',
  'description',
  'preparationTime',
  'tags',
  'availabilityStatus',
];

function CSVImport({ open, onOpenChange, onImport }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const csvFile = acceptedFiles[0];
    if (csvFile && csvFile.type === 'text/csv') {
      setFile(csvFile);
      parseCSV(csvFile);
    } else {
      toast.error('Faqat CSV fayllar qabul qilinadi');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast.error('CSV fayl bo\'sh yoki noto\'g\'ri formatda');
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        
        // Validate headers (case-insensitive)
        const missingHeaders = CSV_TEMPLATE_HEADERS.filter(
          (h) => !headers.includes(h.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          toast.error(`Quyidagi ustunlar topilmadi: ${missingHeaders.join(', ')}`);
          return;
        }

        // Parse data rows
        const data = [];
        const rowErrors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          const row = {};
          const rowErrors_local = [];

          headers.forEach((header, index) => {
            const value = values[index] || '';
            row[header] = value;

            // Validate required fields (case-insensitive)
            const requiredFields = ['name', 'category', 'price'];
            if (requiredFields.includes(header) && !value) {
              rowErrors_local.push(`Qator ${i + 1}: ${header} majburiy`);
            }

            // Validate numeric fields (case-insensitive)
            const numericFields = ['price', 'oldprice', 'stockqty', 'preparationtime'];
            if (numericFields.includes(header) && value) {
              if (isNaN(parseFloat(value))) {
                rowErrors_local.push(`Qator ${i + 1}: ${header} raqam bo'lishi kerak`);
              }
            }
          });

          if (rowErrors_local.length > 0) {
            rowErrors.push(...rowErrors_local);
          } else {
            data.push(row);
          }
        }

        setPreviewData(data);
        setErrors(rowErrors);

        if (rowErrors.length > 0) {
          toast.warning(`${rowErrors.length} ta xatolik topildi`);
        } else {
          toast.success(`${data.length} ta mahsulot topildi`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('CSV faylni o\'qishda xatolik yuz berdi');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = CSV_TEMPLATE_HEADERS.join(',');
    const exampleRow = [
      'Lavash',
      'SKU-000001',
      'Fast Food',
      '25000',
      '30000',
      '100',
      'Tovuq go\'shtli lavash',
      '15',
      'tez ovqat, mashhur',
      'active',
    ].join(',');

    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Shablon yuklab olindi');
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('Import qilish uchun ma\'lumot yo\'q');
      return;
    }

    if (errors.length > 0) {
      toast.error('Avval xatoliklarni tuzating');
      return;
    }

    setIsProcessing(true);
    setSuccessCount(0);

    try {
      // Transform CSV data to product format
      // Note: row keys are already lowercase from parsing
      const products = previewData.map((row, index) => ({
        name: row.name || '',
        sku: row.sku || `SKU-${Date.now()}-${index}`,
        category: row.category || '',
        price: parseFloat(row.price) || 0,
        oldPrice: row.oldprice ? parseFloat(row.oldprice) : null,
        stockQty: row.stockqty ? parseFloat(row.stockqty) : null,
        unlimitedStock: !row.stockqty || row.stockqty === '',
        description: row.description || '',
        preparationTime: row.preparationtime ? parseFloat(row.preparationtime) : null,
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
        availabilityStatus: (row.availabilitystatus || 'active').toLowerCase(),
        images: [],
        variants: [],
        addOns: [],
      }));

      await onImport(products);
      setSuccessCount(products.length);
      toast.success(`${products.length} ta mahsulot muvaffaqiyatli import qilindi`);
      
      // Reset
      setFile(null);
      setPreviewData([]);
      setErrors([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Import qilishda xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setSuccessCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV orqali mahsulotlarni import qilish</DialogTitle>
          <DialogDescription>
            CSV fayl yuklab, mahsulotlarni ommaviy qo'shing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">Shablon yuklab olish</Label>
              <p className="text-sm text-muted-foreground mt-1">
                CSV shablonini yuklab oling va to'ldiring
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Shablon yuklab olish
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <Label>CSV fayl yuklash</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mt-2 ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    {isDragActive
                      ? 'Faylni bu yerga tashlang'
                      : 'CSV faylni bu yerga tashlang yoki bosing'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Faqat CSV fayllar qabul qilinadi
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Xatoliklar topildi</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                  {errors.length > 10 && (
                    <li className="text-sm font-semibold">
                      ... va yana {errors.length - 10} ta xatolik
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Ko'rib chiqish ({previewData.length} ta mahsulot)
                </Label>
                {successCount > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {successCount} ta muvaffaqiyatli
                    </span>
                  </div>
                )}
              </div>
              <div className="border rounded-lg max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomi</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Narx</TableHead>
                      <TableHead>Ombordagi miqdor</TableHead>
                      <TableHead>Holat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="font-mono text-sm">{row.sku || '-'}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          {parseFloat(row.price || 0).toLocaleString()} so'm
                        </TableCell>
                        <TableCell>{row.stockqty || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              row.availabilitystatus === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {row.availabilitystatus || 'active'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    ... va yana {previewData.length - 10} ta mahsulot
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleImport}
            disabled={previewData.length === 0 || errors.length > 0 || isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import qilish ({previewData.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CSVImport;

