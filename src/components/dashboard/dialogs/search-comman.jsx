'use client';

import * as React from 'react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Search,
  Settings,
  Smile,
  User,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SearchCommandDialog() {
  const [open, setOpen] = React.useState(false);

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
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
