import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import ClientLinksModal from '@/components/dashboard/dialogs/ClientLinksModal';
import AddClientLink from '@/components/dashboard/dialogs/AddClientLink';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Search,
  Camera,
  DollarSign,
  CheckCircle2,
  Link,
  HandCoins,
  ClockArrowDown,
  Notebook,
  ArrowUpRightIcon,
  CircleOff,
  PlusCircle,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  LayoutGrid,
  List,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, orders, getClientOrders, addClient, userUid } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [linksViewMode, setLinksViewMode] = useState('list'); // 'list' or 'grid'
  const [linksSearchTerm, setLinksSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedLinksSearch = useDebounce(linksSearchTerm, 300);

  const client = clients.find((c) => c.id === clientId);
  const clientOrders = getClientOrders(clientId);

  const filteredOrders = clientOrders.filter((order) => {
    const search = debouncedSearch.toLowerCase();
    return (
      (order.toyxona && order.toyxona.toLowerCase().includes(search)) ||
      (order.id && order.id.toLowerCase().includes(search)) ||
      (order.mijozIsmi && order.mijozIsmi.toLowerCase().includes(search)) ||
      (order.telefon && order.telefon.includes(search)) ||
      (order.clientName && order.clientName.toLowerCase().includes(search)) ||
      (order.clientPhone && order.clientPhone.includes(search))
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price || 0) + " so'm";
  };

  const getActiveServicesCount = (order) => {
    if (!order.options) return 0;
    return Object.values(order.options).filter(Boolean).length;
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Helper function to check if URL is YouTube
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Filter client links based on search term
  const filteredClientLinks = (client?.clientLinks || []).filter((link) => {
    const search = debouncedLinksSearch.toLowerCase();
    return (
      link.name.toLowerCase().includes(search) ||
      link.link.toLowerCase().includes(search)
    );
  });

  // Helper functions for link management
  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast('Link nusxalandi');
  };

  const openLink = (link) => {
    window.open(link, '_blank');
  };

  const copyPinCode = () => {
    navigator.clipboard.writeText(client.code.toString());
    toast('PIN kodi nusxalandi');
  };

  const handleAddLink = () => {
    setShowAddLinkModal(true);
  };

  const handleAddLinkSubmit = async (linkData) => {
    try {
      const updatedClient = {
        ...client,
        clientLinks: [...(client.clientLinks || []), linkData],
      };
      await addClient(updatedClient, userUid);
      toast("Link muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error('Error adding link:', error);
      toast("Link qo'shishda xatolik yuz berdi");
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Mijoz topilmadi</h2>
          <p className="text-muted-foreground mb-4">
            Bu mijoz mavjud emas yoki o'chirilgan
          </p>
          <Button onClick={() => navigate('/dashboard/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mijozlar ro'yxatiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex items-start justify-between w-full">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-3">
            <span>{client.name}</span>
            <Badge className="flex items-center gap-2 text-sm">
              <ClockArrowDown className="h-4 w-4 text-white" />
              <span className="text-sm">{clientOrders.length} ta </span>
            </Badge>
          </h1>
          <div className="mt-2 lg:mt-3 flex flex-wrap items-center  gap-3 lg:gap-5">
            <Badge
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              <HandCoins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatPrice(
                  clientOrders.reduce(
                    (sum, order) => sum + (order.narx || 0),
                    0
                  )
                )}
              </span>
            </Badge>
            <div
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{client.phone}</span>
            </div>
            <div
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.address}</span>
            </div>
            <div
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLinksModal(true)}
          className="flex items-center gap-2"
        >
          <Link className="h-4 w-4" />
          Linklar ro'yati
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Buyurtmalar ro'yxati</TabsTrigger>
          <TabsTrigger value="links">Havolalar ro'yxati</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buyurtmani qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
                <Button
                  className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
                  variant="outline"
                  size="icon"
                  aria-label="Flip Horizontal"
                >
                  <LayoutGrid size={16} aria-hidden="true" />
                </Button>
                <Button
                  className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
                  variant="outline"
                  size="icon"
                  aria-label="Flip Vertical"
                >
                  <List size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl"
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                          <CardTitle className="text-balance text-lg leading-tight">
                            {order.toyxona || 'N/A'}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {formatPrice(order.narx || 0)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Sana:</span>
                        <span className="ml-auto font-medium">
                          {formatDate(order.sana)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Kamera:</span>
                        <span className="ml-auto font-medium">
                          {order.kameraSoni} ta
                        </span>
                      </div>
                      {getActiveServicesCount(order) > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Xizmatlar:
                          </span>
                          <span className="ml-auto font-medium">
                            {getActiveServicesCount(order)} ta
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 border-t pt-3 text-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Narx:</span>
                        <span className="ml-auto text-lg font-bold text-primary">
                          {formatPrice(order.narx || 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 lg:py-12 border rounded-lg">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleOff />
                    </EmptyMedia>
                    <EmptyTitle>Hali buyurtma mavjud emas!</EmptyTitle>
                    <EmptyDescription>
                      Ushbu mijozga yangi buyurtma biriktirish uchun buyurtma
                      qo'shish bo'imiga oting.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate('/dashboard/create-order')}
                        className="flex items-center gap-2"
                      >
                        Buyurtma qo'shish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/dashboard/clients')}
                        className="flex items-center gap-2"
                      >
                        Ortga qaytish
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="links">
          <div className="space-y-4 w-full">
            <div className="flex items-start justify-between p-3 group shadow-sm transition-shadow border border-border rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-2xl font-mono bg-muted"
                  >
                    {client.code}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Mijozning shaxsiy Pincodi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPinCode}
                  className="flex items-center gap-2"
                >
                  Nusxalash
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddLink}
                  className="flex items-center gap-2"
                >
                  Havola qo'shish
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Havolalarni qidirish..."
                  value={linksSearchTerm}
                  onChange={(e) => setLinksSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
                <Button
                  className={`rounded-none shadow-none first:rounded-s-md last:rounded-e-md hover:bg-white focus-visible:z-10 ${
                    linksViewMode === 'grid' ? '' : 'bg-muted text-primary'
                  }`}
                  variant="outline"
                  size="icon"
                  aria-label="Grid View"
                  onClick={() => setLinksViewMode('grid')}
                >
                  <LayoutGrid size={16} aria-hidden="true" />
                </Button>
                <Button
                  className={`rounded-none shadow-none first:rounded-s-md last:rounded-e-md hover:bg-white focus-visible:z-10 ${
                    linksViewMode === 'list' ? '' : 'bg-muted text-primary'
                  }`}
                  variant="outline"
                  size="icon"
                  aria-label="List View"
                  onClick={() => setLinksViewMode('list')}
                >
                  <List size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Links Content */}
            {filteredClientLinks.length > 0 ? (
              linksViewMode === 'list' ? (
                <div className="space-y-3">
                  {filteredClientLinks.map((link, index) => (
                    <div
                      key={index}
                      className="group shadow-sm transition-shadow border border-border rounded-xl"
                    >
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* YouTube Thumbnail or Default Icon */}
                            {isYouTubeUrl(link.link) ? (
                              <div className="flex-shrink-0">
                                <img
                                  src={getYouTubeThumbnail(link.link)}
                                  alt={link.name}
                                  className="w-20 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-20 h-16 bg-muted rounded-lg hidden items-center justify-center">
                                  <Link className="h-6 w-6 text-muted-foreground" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                <Link className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              {isYouTubeUrl(link.link) && (
                                <Badge
                                  variant="destructive"
                                  className="mt-1 text-xs"
                                >
                                  YouTube Video
                                </Badge>
                              )}
                              <h3 className="font-medium text-base max-w-[35rem] truncate">
                                {link.name}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyLink(link.link)}
                              className="flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openLink(link.link)}
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Grid View
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClientLinks.map((link, index) => (
                    <div
                      key={index}
                      className="group overflow-hidden border-2 transition-all hover:border-border shadow-sm rounded-xl"
                    >
                      <div className="relative">
                        {/* YouTube Thumbnail or Default Background */}
                        {isYouTubeUrl(link.link) ? (
                          <div className="aspect-video relative cursor-pointer">
                            <img
                              src={getYouTubeThumbnail(link.link)}
                              alt={link.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="absolute inset-0 bg-muted hidden items-center justify-center">
                              <Link className="h-12 w-12 text-muted-foreground" />
                            </div>
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                <ExternalLink className="h-6 w-6 text-black" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Link className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}

                        {/* YouTube Badge */}
                        {isYouTubeUrl(link.link) && (
                          <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
                            YouTube
                          </Badge>
                        )}
                      </div>

                      <div className="px-4 py-2 flex flex-col justify-between space-y-4">
                        <h3 className="font-medium text-[1.1rem] line-clamp-1">
                          {link.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(link.link);
                            }}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Nusxalash
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLink(link.link);
                            }}
                            className="flex-1"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ochish
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8 lg:py-12 border rounded-lg">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleOff />
                    </EmptyMedia>
                    <EmptyTitle>
                      {linksSearchTerm
                        ? 'Havola topilmadi!'
                        : 'Hali havola mavjud emas!'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {linksSearchTerm
                        ? "Qidiruv so'zini o'zgartiring"
                        : "Ushbu mijozga yangi havola qo'shish uchun tugmani bosing."}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button size="sm" onClick={handleAddLink}>
                      Havola qo'shish
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ClientLinksModal
        open={showLinksModal}
        onOpenChange={setShowLinksModal}
        client={client}
      />

      <AddClientLink
        open={showAddLinkModal}
        onOpenChange={setShowAddLinkModal}
        onSubmit={handleAddLinkSubmit}
      />
    </div>
  );
}
