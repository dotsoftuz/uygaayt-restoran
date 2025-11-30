'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FolderTree,
  Package,
  DollarSign,
  Tag,
  Settings,
  History,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'main'],
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: ClipboardList,
    keywords: ['orders', 'order', 'buyurtmalar'],
  },
  {
    title: 'Categories',
    url: '/dashboard/catalog',
    icon: FolderTree,
    keywords: ['categories', 'category', 'katalog', 'catalog'],
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: Package,
    keywords: ['products', 'product', 'mahsulotlar', 'mahsulot'],
  },
  {
    title: 'Finance',
    url: '/dashboard/finance',
    icon: DollarSign,
    keywords: ['finance', 'financial', 'moliya', 'money'],
  },
  {
    title: 'Promotions',
    url: '/dashboard/promotions',
    icon: Tag,
    keywords: ['promotions', 'promotion', 'aktsiya', 'discount'],
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
    keywords: ['settings', 'setting', 'sozlamalar', 'config'],
  },
  {
    title: 'Activity Log',
    url: '/dashboard/activity-log',
    icon: History,
    keywords: ['activity', 'log', 'history', 'tarix'],
  },
  {
    title: 'Help',
    url: '/dashboard/help',
    icon: HelpCircle,
    keywords: ['help', 'yordam', 'support'],
  },
];

export function SearchCommandDialog() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const filteredNavItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return navigationItems;
    }

    const query = searchQuery.toLowerCase();
    return navigationItems.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      return titleMatch || keywordMatch;
    });
  }, [searchQuery]);

  const handleSelect = (url) => {
    navigate(url);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Custom div as input */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => setOpen(true)}
            className="my-3 relative cursor-pointer rounded-lg border border-border hover:bg-muted/50 px-3 py-2 transition-colors flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
            title="Click or press Ctrl+K"
          >
            <Search className="w-4 h-4 text-muted-foreground group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
            <span className="text-muted-foreground text-sm group-data-[collapsible=icon]:hidden">
              Search...
            </span>
            <div className="ml-auto flex items-center gap-0.5 group-data-[collapsible=icon]:hidden">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="group-data-[collapsible=icon]:block hidden"
        >
          <p>Search (⌘K)</p>
        </TooltipContent>
      </Tooltip>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Sahifalarni qidiring..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {filteredNavItems.length > 0 ? (
            <CommandGroup heading="Sahifalar">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    onSelect={() => handleSelect(item.url)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : (
            <CommandEmpty>Hech nima topilmadi.</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
