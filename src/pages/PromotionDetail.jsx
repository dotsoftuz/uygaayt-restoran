import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Search,
    Calendar,
    TrendingUp,
    User,
    ShoppingCart,
    DollarSign,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
import api from '@/services/api';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Loader2 } from 'lucide-react';

// Helper function to format image URL
const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    let url = imageUrl;
    if (url.startsWith('uploads/')) {
        url = url.replace('uploads/', '');
    }
    return `${cleanBaseUrl}/uploads/${url}`;
};

function PromotionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [promotion, setPromotion] = useState(null);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    // Fetch promotion details
    const fetchPromotion = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/store/promocode/get-by-id/${id}`);
            const promoData = response?.data || response;

            const mappedPromotion = {
                id: promoData._id,
                name: promoData.name || '',
                code: promoData.code || '',
                amount: promoData.amount || 0,
                minOrderPrice: promoData.minOrderPrice || 0,
                fromDate: promoData.fromDate ? new Date(promoData.fromDate) : null,
                toDate: promoData.toDate ? new Date(promoData.toDate) : null,
                maxUsage: promoData.maxUsage,
                maxUsageForUser: promoData.maxUsageForUser || 1,
                usedCount: promoData.usedCount || 0,
                isActive: promoData.state === 'active',
                description: promoData.description || '',
                bannerImage: promoData.bannerImage ? {
                    _id: promoData.bannerImage._id,
                    url: promoData.bannerImage.url,
                    formattedUrl: formatImageUrl(promoData.bannerImage.url),
                } : null,
            };

            setPromotion(mappedPromotion);
        } catch (error) {
            console.error('Error fetching promotion:', error);
            toast.error('Promokod ma\'lumotlarini yuklashda xatolik yuz berdi');
            navigate('/dashboard/promotions');
        } finally {
            setLoading(false);
        }
    };

    // Fetch promotion history
    const fetchHistory = async () => {
        if (!id) return;

        try {
            setHistoryLoading(true);
            const response = await api.post('/store/promocode/history/paging', {
                promocodeId: id,
                page,
                limit,
                search: debouncedSearchTerm || undefined,
            });

            let historyList = [];
            if (response?.data?.data && Array.isArray(response.data.data)) {
                historyList = response.data.data;
            } else if (response?.data && Array.isArray(response.data)) {
                historyList = response.data;
            } else if (Array.isArray(response)) {
                historyList = response;
            }

            const mappedHistory = historyList.map((item) => ({
                id: item._id,
                customer: item.customer ? {
                    firstName: item.customer.firstName || '',
                    lastName: item.customer.lastName || '',
                    phoneNumber: item.customer.phoneNumber || '',
                    fullName: `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim() || 'Noma\'lum',
                } : null,
                order: item.order ? {
                    number: item.order.number || '',
                    createdAt: item.order.createdAt ? new Date(item.order.createdAt) : null,
                    totalPrice: item.order.totalPrice || 0,
                } : null,
                amount: item.amount || 0,
                createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            }));

            setHistory(mappedHistory);
            setTotal(response?.data?.total || response?.total || 0);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Ishlatilganlik tarixini yuklashda xatolik yuz berdi');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPromotion();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchHistory();
        }
    }, [id, page, debouncedSearchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!promotion) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TrendingUp className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Promokod topilmadi</EmptyTitle>
                    <EmptyDescription>
                        Promokod ma'lumotlari topilmadi yoki o'chirilgan bo'lishi mumkin.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-4 py-2 sm:py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate('/dashboard/promotions')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="title">{promotion.name || promotion.code}</h2>
                        <p className="paragraph">
                            Promokod ma'lumotlari va ishlatilganlik tarixi
                        </p>
                    </div>
                </div>
            </div>

            {/* Banner Image */}
            {promotion.bannerImage?.formattedUrl && (
                <Card>
                    <CardContent className="p-0">
                        <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden">
                            <img
                                src={promotion.bannerImage.formattedUrl}
                                alt={promotion.name || promotion.code}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Promotion Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Promokod</span>
                        </div>
                        <p className="text-lg font-semibold font-mono">{promotion.code}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Chegirma summasi</span>
                        </div>
                        <p className="text-lg font-semibold">
                            {promotion.amount.toLocaleString()} so'm
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Ishlatilgan</span>
                        </div>
                        <p className="text-lg font-semibold">
                            {promotion.usedCount || 0}
                            {promotion.maxUsage && (
                                <span className="text-sm text-muted-foreground font-normal">
                                    {' '}/ {promotion.maxUsage}
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Foydalanuvchi limiti</span>
                        </div>
                        <p className="text-lg font-semibold">
                            {promotion.maxUsageForUser || 1} marta
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div>
                            <span className="text-sm text-muted-foreground">Minimal buyurtma summasi</span>
                            <p className="text-base font-medium">
                                {promotion.minOrderPrice.toLocaleString()} so'm
                            </p>
                        </div>
                        {promotion.description && (
                            <div>
                                <span className="text-sm text-muted-foreground">Tavsif</span>
                                <p className="text-base">{promotion.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-sm text-muted-foreground">Boshlanish sanasi</span>
                                <p className="text-base font-medium">
                                    {promotion.fromDate ? formatDate(promotion.fromDate) : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-sm text-muted-foreground">Tugash sanasi</span>
                                <p className="text-base font-medium">
                                    {promotion.toDate ? formatDate(promotion.toDate) : '-'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Holati</span>
                            <div className="mt-1">
                                <Badge variant={promotion.isActive ? "default" : "secondary"}>
                                    {promotion.isActive ? 'Faol' : 'Faol emas'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Section */}
            <Card>
                <CardContent className="p-0">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">Ishlatilganlik tarixi</h3>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Mijoz yoki buyurtma bo'yicha qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* History Table */}
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Mijoz</TableHead>
                                        <TableHead className="hidden sm:table-cell w-[150px]">Telefon</TableHead>
                                        <TableHead className="hidden md:table-cell w-[120px]">Buyurtma</TableHead>
                                        <TableHead className="w-[120px]">Chegirma</TableHead>
                                        <TableHead className="hidden lg:table-cell w-[180px]">Sana</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {item.customer?.fullName || 'Noma\'lum mijoz'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {item.customer?.phoneNumber || '-'}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {item.order ? (
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-mono text-sm">
                                                            #{item.order.number}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-primary">
                                                    {item.amount.toLocaleString()} so'm
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(item.createdAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <TrendingUp className="h-6 w-6" />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {searchTerm ? 'Tarix topilmadi' : 'Hali ishlatilmagan'}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {searchTerm
                                        ? 'Qidiruv natijasiga mos ma\'lumot topilmadi'
                                        : 'Bu promokod hali hech kim tomonidan ishlatilmagan'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {/* Pagination */}
                    {total > limit && (
                        <div className="p-4 border-t flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Jami: {total} ta yozuv
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Oldingi
                                </Button>
                                <span className="text-sm">
                                    {page} / {Math.ceil(total / limit)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= Math.ceil(total / limit)}
                                >
                                    Keyingi
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default PromotionDetail;

