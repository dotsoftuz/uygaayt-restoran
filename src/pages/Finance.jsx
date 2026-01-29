import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDateTime, formatNumber } from '@/lib/utils';
import api from '@/services/api';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';

const chartConfig = {
  amount: {
    label: 'amount',
    color: '#3b82f6',
  },
};

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

const TransactionCard = ({ transaction, onView }) => {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TransactionTypeBadge type={transaction.type} />
              <CategoryBadge category={transaction.customType} />
            </div>
            {transaction.comment && (
              <p className="text-sm text-muted-foreground truncate">
                {transaction.comment}
              </p>
            )}
          </div>
          <div className="text-right">
            <p
              className={`font-semibold text-lg ${
                transaction.type === 'income'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatNumber(transaction.amount)} {t('currency')}
            </p>
          </div>
        </div>
        <div className="space-y-1 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{t('date')}:</span>
            <span className="font-medium">
              {formatDateTime(transaction.createdAt)}
            </span>
          </div>
          {transaction.orderId && (
            <div className="flex items-center justify-between">
              <span>{t('order')}:</span>
              <span className="font-medium">#{transaction.orderId}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(transaction)}
          className="w-full text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          {t('details')}
        </Button>
      </CardContent>
    </Card>
  );
};

const TransactionTableRow = ({ transaction, isMobile, onView }) => {
  const { t } = useTranslation();
  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer"
      onClick={() => onView(transaction)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <TransactionTypeBadge type={transaction.type} />
          <CategoryBadge category={transaction.customType} />
        </div>
      </TableCell>
      <TableCell>
        <p
          className={`font-semibold ${
            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatNumber(transaction.amount)} {t('currency')}
        </p>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {transaction.comment ? (
          <p className="text-sm truncate max-w-[200px]">
            {transaction.comment}
          </p>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs">
        {formatDateTime(transaction.createdAt)}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(transaction);
          }}
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

function Finance() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  const [dateRange, setDateRange] = useState(() => {
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom && dateTo) {
      return {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      };
    }
    return null;
  });

  const [statistics, setStatistics] = useState({
    storeBalance: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const fetchStatistics = async () => {
    setStatisticsLoading(true);
    try {
      const params = {};
      if (dateRange?.from && dateRange?.to) {
        params.dateFrom = dateRange.from.toISOString();
        params.dateTo = dateRange.to.toISOString();
      }
      const response = await api.post('/store/balance/total', params);
      console.log(
        '[FINANCE] Full response:',
        JSON.stringify(response, null, 2)
      );
      console.log('[FINANCE] response type:', typeof response);
      console.log('[FINANCE] response keys:', Object.keys(response || {}));
      console.log('[FINANCE] response.storeBalance:', response?.storeBalance);
      console.log(
        '[FINANCE] response.data?.storeBalance:',
        response?.data?.storeBalance
      );
      console.log('[FINANCE] response.data:', response?.data);

      const storeBalance =
        response?.storeBalance ?? response?.data?.storeBalance ?? 0;
      console.log('[FINANCE] Final storeBalance value:', storeBalance);
      console.log(
        '[FINANCE] Setting statistics with storeBalance:',
        storeBalance
      );

      setStatistics({
        storeBalance: storeBalance,
      });

      console.log('[FINANCE] Statistics state updated');
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error(t('statisticsLoadError'));
    } finally {
      setStatisticsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (dateRange?.from && dateRange?.to) {
        params.dateFrom = dateRange.from.toISOString();
        params.dateTo = dateRange.to.toISOString();
      }
      const response = await api.post('/store/balance/paging', params);
      const responseData = response?.data || {};
      const data = responseData?.data || [];
      const total = responseData?.total || 0;

      const mappedTransactions = Array.isArray(data)
        ? data.map((tr) => ({
            _id: tr._id,
            type: tr.type,
            customType: tr.customType,
            amount: tr.amount,
            beforeAmount: tr.beforeAmount,
            afterAmount: tr.afterAmount,
            comment: tr.comment,
            orderId: tr.order?.number || tr.orderId,
            customerId: tr.customerId,
            createdAt: tr.createdAt ? new Date(tr.createdAt) : new Date(),
          }))
        : [];

      setTransactions(mappedTransactions);
      setTotalTransactions(total || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(t('transactionsLoadError'));
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, currentPage, itemsPerPage]);

  useEffect(() => {
    console.log('[FINANCE] Statistics state changed:', statistics);
    console.log('[FINANCE] statistics.storeBalance:', statistics.storeBalance);
  }, [statistics]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
      });
    } else {
      const newParams = { ...searchParams };
      delete newParams.dateFrom;
      delete newParams.dateTo;
      setSearchParams(newParams);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (tr) =>
          tr.comment
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          tr.orderId?.toString().includes(debouncedSearchTerm) ||
          tr.amount?.toString().includes(debouncedSearchTerm)
      );
    }

    return filtered;
  }, [transactions, debouncedSearchTerm]);

  const chartData = useMemo(() => {
    const groupedByDate = {};
    transactions.forEach((tr) => {
      const dateKey = tr.createdAt.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, amount: 0 };
      }
      groupedByDate[dateKey].amount += tr.amount;
    });
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        date: item.date,
        amount: item.amount,
      }));
  }, [transactions]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        [t('type'), t('category'), t('amount'), t('note'), t('date')].join(','),
        ...filteredTransactions.map((tr) =>
          [
            tr.type === 'income' ? t('income') : t('expense'),
            tr.customType,
            tr.amount,
            tr.comment || '',
            formatDateTime(tr.createdAt),
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transactions_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('csvDownloaded'));
  };

  const handleView = (transaction) => {
    console.log('View transaction:', transaction);
  };

  const hasActiveFilters = debouncedSearchTerm;

  return (
    <div className="space-y-4 py-2 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">{t('finance')}</h2>
          <p className="paragraph">{t('financeDescription')}</p>
        </div>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalBalance')}
            </CardTitle>
            <div className="bg-blue-500/10 rounded-full p-2 border border-blue-500/20">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {statisticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${formatNumber(statistics.storeBalance)} ${t('currency')}`
              )}
            </div>
          </CardContent>
        </Card>

        {transactions.length > 0 && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('lastTransaction')}
              </CardTitle>
              <div className="bg-green-500/10 rounded-full p-2 border border-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TransactionTypeBadge type={transactions[0].type} />
                    <CategoryBadge category={transactions[0].customType} />
                  </div>
                  <p
                    className={`font-semibold text-lg ${
                      transactions[0].type === 'income'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {transactions[0].type === 'income' ? '+' : '-'}
                    {formatNumber(transactions[0].amount)} {t('currency')}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{t('date')}:</span>
                    <span className="font-medium">
                      {formatDateTime(transactions[0].createdAt)}
                    </span>
                  </div>
                  {transactions[0].orderId && (
                    <div className="flex items-center justify-between mt-1">
                      <span>{t('order')}:</span>
                      <span className="font-medium">
                        #{transactions[0].orderId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchTransactionsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </div>

        {loading ? (
          viewMode === 'card' || isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-24"></div>
                    </div>
                    <div className="space-y-2 py-2 border-t">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t('note')}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t('date')}
                      </TableHead>
                      <TableHead className="text-right">
                        {t('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(10)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        ) : filteredTransactions.length > 0 ? (
          viewMode === 'card' || isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                  onView={handleView}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t('note')}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t('date')}
                      </TableHead>
                      <TableHead className="text-right">
                        {t('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TransactionTableRow
                        key={transaction._id}
                        transaction={transaction}
                        isMobile={isMobile}
                        onView={handleView}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm || hasActiveFilters
                  ? t('transactionNotFound')
                  : t('noTransactionsYet')}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm || hasActiveFilters
                  ? t('noTransactionsMatchSearch')
                  : t('noTransactionsDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {totalTransactions > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {t('showPerPage')}:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalTransactions)}{' '}
                {t('of')} {totalTransactions} {t('unit')}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-initial"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">{t('previous')}</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground px-2">
                {currentPage} / {Math.ceil(totalTransactions / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(totalTransactions / itemsPerPage),
                      currentPage + 1
                    )
                  )
                }
                disabled={
                  currentPage >= Math.ceil(totalTransactions / itemsPerPage)
                }
                className="flex-1 sm:flex-initial"
              >
                <span className="text-xs sm:text-sm">{t('next')}</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('transactionStatistics')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t('transactionStatisticsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-[300px] sm:h-[400px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString(t('localeCode'), {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString(
                        t('localeCode'),
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      );
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillAmount)"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Finance;
