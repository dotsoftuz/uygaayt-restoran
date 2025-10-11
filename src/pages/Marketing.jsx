import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Phone,
  DollarSign,
  Loader2,
  Search,
  CircleOff,
  Target,
  MoreHorizontal,
  TrendingUp,
  Users,
  Mail,
  BarChart3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

function Marketing() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreateNew = () => {
    // navigate('/dashboard/create-campaign');
    console.log('Create new campaign');
  };

  const handleEdit = (campaignId) => {
    // navigate(`/dashboard/edit-campaign/${campaignId}`);
    console.log('Edit campaign:', campaignId);
  };

  const handleView = (campaignId) => {
    // navigate(`/dashboard/campaign-detail/${campaignId}`);
    console.log('View campaign:', campaignId);
  };

  const handleDelete = async (campaignId) => {
    if (window.confirm("Bu kampaniyani o'chirishni xohlaysizmi?")) {
      setDeletingId(campaignId);
      try {
        // await removeCampaign(campaignId);
        console.log('Delete campaign:', campaignId);
      } catch (error) {
        console.error('Error deleting campaign:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Kampaniyalar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Marketing kampaniyalari
          </h2>
          <p className="text-muted-foreground">
            Yangi marketing kampaniyasi yaratish uchun "Kampaniya yaratish"
            tugmasini bosing.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi kampaniya
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kampaniyalarni qidirish..."
          className="pl-10"
        />
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-lg">{campaign.name}</span>
                </div>
                <Badge
                  variant={
                    campaign.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {campaign.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Boshlanish: {campaign.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Tugash: {campaign.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Maqsadli auditoriya: {campaign.targetAudience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Natija: {campaign.results || '0%'} konversiya</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Byudjet: {campaign.budget} so'm</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleView(campaign.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(campaign.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(campaign.id)}
                  disabled={deletingId === campaign.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === campaign.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12 border rounded-lg bg-muted/50">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>Hali kampaniyalar mavjud emas!</EmptyTitle>
              <EmptyDescription>
                Yangi marketing kampaniyasi yaratish uchun "Kampaniya yaratish"
                tugmasini bosing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Kampaniya yaratish
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default Marketing;
