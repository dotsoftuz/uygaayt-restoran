import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime, formatNumber } from '@/lib/utils';
import api from '@/services/api';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  ShoppingCart,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TransactionTypeBadge = ({ type }) => {
  const { t } = useTranslation();
  const config = {
    income: {
      label: t('income'),
      variant: 'default',
      className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    expense: {
      label: t('expense'),
      variant: 'destructive',
      className: 'bg-red-500/10 text-red-500 border-red-500/20',
    },
  };
  const item = config[type] || config.income;
  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  );
};

const CategoryBadge = ({ category }) => {
  const { t } = useTranslation();
  const categoryLabels = {
    order: t('order'),
    user_bonus: t('customerBonus'),
    withdraw_balance: t('withdrawBalance'),
    buy_premium: t('buyPremium'),
    cashback: t('cashback'),
    fill_balance: t('fillBalance'),
  };
  const label = categoryLabels[category] || category;
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  copyable = false,
  clickable = false,
  onClick,
}) => {
  const handleCopy = () => {
    if (copyable && value) {
      navigator.clipboard.writeText(value.toString());
      toast(t('copy') || 'Copied');
    }
  };

  const handleRowClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`flex items-center justify-between py-3 border-b border-border/50 last:border-0 ${clickable ? 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${clickable ? 'text-primary hover:underline' : ''}`}
        >
          {value || '-'}
        </span>
        {copyable && value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
        {clickable && (
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const fetchCustomerName = async (customerId) => {
    if (!customerId) return;
    setLoadingCustomer(true);
    try {
      const response = await api.get(`/customer/${customerId}`);
      const name =
        response?.data?.name ||
        response?.data?.fullName ||
        t('unknownCustomer');
      setCustomerName(name);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomerName(t('unknownCustomer'));
    } finally {
      setLoadingCustomer(false);
    }
  };

  React.useEffect(() => {
    if (open && transaction?.customerId) {
      fetchCustomerName(transaction.customerId);
    }
  }, [open, transaction?.customerId]);

  const handleOrderClick = (orderId) => {
    if (orderId) {
      navigate(`/dashboard/order-detail/${orderId}`);
      onOpenChange(false);
    }
  };

  if (!transaction) return null;

  const {
    _id,
    type,
    customType,
    amount,
    beforeAmount,
    afterAmount,
    comment,
    orderId,
    customerId,
    createdAt,
  } = transaction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'income' ? (
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
            {t('transactionDetails')}
          </DialogTitle>
          <DialogDescription>
            {t('transactionDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Transaction Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TransactionTypeBadge type={type} />
                  <CategoryBadge category={customType} />
                </div>
                <div
                  className={`text-xl font-bold ${
                    type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {type === 'income' ? '+' : '-'}
                  {formatNumber(amount)} {t('currency')}
                </div>
              </div>
              {comment && (
                <div className="pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t('note')}</p>
                      <p className="text-sm text-muted-foreground">{comment}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('balanceInformation')}
              </CardTitle>
            </CardHeader>
            <div className="space-y-2 !p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('beforeTransaction')}:
                </span>
                <span className="font-medium">
                  {formatNumber(beforeAmount)} {t('currency')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('transactionAmount')}:
                </span>
                <span
                  className={`font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {type === 'income' ? '+' : '-'}
                  {formatNumber(amount)} {t('currency')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>{t('afterTransaction')}:</span>
                <span
                  className={
                    afterAmount >= 0 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {formatNumber(afterAmount)} {t('currency')}
                </span>
              </div>
            </div>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <InfoRow
                icon={Calendar}
                label={t('date')}
                value={formatDateTime(createdAt)}
              />
              <InfoRow
                icon={ShoppingCart}
                label={t('orderId')}
                value={orderId ? `#${orderId}` : null}
                copyable={!!orderId}
                clickable={!!orderId}
                onClick={() => handleOrderClick(orderId)}
              />
              <InfoRow
                icon={User}
                label={t('customerName')}
                value={loadingCustomer ? t('loading') : customerName || '-'}
                copyable={false}
              />
              <InfoRow icon={FileText} label={t('transactionId')} value={_id} />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
