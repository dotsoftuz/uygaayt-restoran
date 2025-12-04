import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  User,
  Package,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function Reviews() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Filters
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [limit] = useState(20);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ratingFilter, setRatingFilter] = useState(
    searchParams.get('rating') || 'all'
  );
  const debouncedSearch = useDebounce(search, 500);

  // Load reviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      const payload = {
        page,
        limit,
      };

      if (debouncedSearch) {
        payload.search = debouncedSearch;
      }

      if (ratingFilter !== 'all') {
        payload.rating = parseInt(ratingFilter);
      }

      const response = await api.post('/store/review/my/paging', payload);
      const data = response?.data || response;

      if (data) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error(
        error?.message || 'Sharhlarni yuklashda xatolik yuz berdi'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await api.get('/store/review/my/stats');
      const data = response?.data || response;

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [page, debouncedSearch, ratingFilter]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (ratingFilter !== 'all') params.set('rating', ratingFilter);
    setSearchParams(params, { replace: true });
  }, [page, debouncedSearch, ratingFilter, setSearchParams]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!reviews.length) return 1;
    // Assuming backend returns total in response
    return Math.ceil((reviews.total || reviews.length) / limit);
  }, [reviews, limit]);

  // Handle review click
  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setReviewDialogOpen(true);
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  // Get rating badge color
  const getRatingBadgeColor = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Format image URL
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

  // Handle order click
  const handleOrderClick = (orderId) => {
    if (orderId) {
      navigate(`/dashboard/order-detail/${orderId}`);
    }
  };

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Sharhlar</h2>
          <p className="paragraph">
            Mijozlaringizning sharhlari va baholari
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                O'rtacha Baho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {stats.averageRating?.toFixed(1) || '0.0'}
                </div>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCount || 0} ta sharh
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                5 Yulduz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rating5 || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Jami sharhlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                4 Yulduz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rating4 || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Jami sharhlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                1-3 Yulduz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(stats.rating1 || 0) + (stats.rating2 || 0) + (stats.rating3 || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Jami sharhlar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Mijoz nomi yoki sharh bo'yicha qidirish..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={ratingFilter}
            onValueChange={(value) => {
              setRatingFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Baho bo'yicha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha baholar</SelectItem>
              <SelectItem value="5">5 yulduz</SelectItem>
              <SelectItem value="4">4 yulduz</SelectItem>
              <SelectItem value="3">3 yulduz</SelectItem>
              <SelectItem value="2">2 yulduz</SelectItem>
              <SelectItem value="1">1 yulduz</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Baho</TableHead>
                  <TableHead>Sharh</TableHead>
                  <TableHead>Buyurtma</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Harakatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-muted rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-7 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <Star className="w-12 h-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sharhlar topilmadi</EmptyTitle>
            <EmptyDescription>
              Hozircha hech qanday sharh yo'q
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mijoz</TableHead>
                    <TableHead>Baho</TableHead>
                    <TableHead>Sharh</TableHead>
                    <TableHead>Buyurtma</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead className="text-right">Harakatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {review.customer?.firstName?.[0] || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {review.customer?.firstName || 'Mijoz'}{' '}
                              {review.customer?.lastName || ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.customer?.phoneNumber || ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStars(review.rating)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          {review.comment ? (
                            <p className="text-sm line-clamp-2">
                              {review.comment}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sharh yo'q
                            </span>
                          )}
                          {review.rateComments && review.rateComments.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {review.rateComments.map((rc, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {rc.title?.uz || rc.title}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {review.order?._id ? (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleOrderClick(review.order._id)}
                          >
                            #{review.order.number}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {review.createdAt
                            ? formatDateTime(new Date(review.createdAt))
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReviewClick(review)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ko'rish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Sahifa {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Oldingi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Keyingi
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Sharh Tafsilotlari</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-5 pt-2">
              {/* Order & Date Info - Top */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b">
                {selectedReview.order && (
                  <div>
                    <div className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Buyurtma
                    </div>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleOrderClick(selectedReview.order._id)}
                    >
                      #{selectedReview.order.number}
                    </Badge>
                  </div>
                )}
                <div className="ml-auto">
                  <div className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Sana
                  </div>
                  <div className="font-medium text-sm">
                    {selectedReview.createdAt
                      ? formatDateTime(new Date(selectedReview.createdAt))
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-base bg-primary/10 text-primary">
                    {selectedReview.customer?.firstName?.[0] || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">
                    {selectedReview.customer?.firstName || 'Mijoz'}{' '}
                    {selectedReview.customer?.lastName || ''}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                    {selectedReview.customer?.phoneNumber || ''}
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Comment */}
              {selectedReview.comment && (
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Sharh
                  </div>
                  <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                    {selectedReview.comment}
                  </p>
                </div>
              )}

              {/* Rate Comments */}
              {selectedReview.rateComments &&
                selectedReview.rateComments.length > 0 && (
                  <div>
                    <div className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                      Tanlangan Xususiyatlar
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReview.rateComments.map((rc, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {rc.title?.uz || rc.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Rasmlar ({selectedReview.images.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReview.images.map((img, idx) => {
                      const imageUrl = formatImageUrl(img.url || img.webpUrl);
                      return (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-md overflow-hidden border hover:border-primary transition-colors group cursor-pointer bg-muted/20"
                          onClick={() => {
                            if (imageUrl) {
                              window.open(imageUrl, '_blank');
                            }
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`Review image ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                console.error('Image load error:', imageUrl);
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-muted/50 flex items-center justify-center hidden">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Info */}
              {selectedReview.product && (
                <div className="pt-2 border-t">
                  <div className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wide">
                    Mahsulot
                  </div>
                  <div className="font-medium text-sm">
                    {selectedReview.product.name?.uz || selectedReview.product.name}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Reviews;
