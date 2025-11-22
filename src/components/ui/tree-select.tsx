'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { useDebounce } from '@/hooks/use-debounce'

export interface Category {
  _id: string
  number: number
  name: {
    uz?: string
    ru?: string
    en?: string
  }
  imageId?: string
  parentId?: string
  storeId?: string
  createdAt?: string
  updatedAt?: string
  children?: Category[]
}

interface TreeSelectProps {
  categories: Category[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  language?: 'uz' | 'ru' | 'en'
}

interface TreeItemProps {
  category: Category
  onSelect: (id: string) => void
  level?: number
  language: 'uz' | 'ru' | 'en'
  searchQuery?: string
}

const getCategoryLabel = (category: Category, language: 'uz' | 'ru' | 'en'): string => {
  return category.name[language] || category.name.uz || category.name.en || 'Unnamed'
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  ({ category, onSelect, level = 0, language, searchQuery = '' }, ref) => {
    // Auto-expand if there's a search query and category has children
    const [isOpen, setIsOpen] = React.useState(!!searchQuery)
    const hasChildren = category.children && category.children.length > 0
    const label = getCategoryLabel(category, language)

    // Auto-expand when search query changes
    React.useEffect(() => {
      if (searchQuery && hasChildren) {
        setIsOpen(true)
      }
    }, [searchQuery, hasChildren])

    return (
      <div ref={ref}>
        <div className="flex items-center gap-1 group">
          {hasChildren && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'p-1 flex-shrink-0 transition-all duration-200 hover:bg-accent/50 rounded-md',
                isOpen && 'rotate-90',
              )}
              aria-label={isOpen ? 'Collapse' : 'Expand'}
            >
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}
          {!hasChildren && <div className="w-6 flex-shrink-0" />}
          <button
            onClick={() => onSelect(category._id)}
            className={cn(
              'flex-1 text-left px-2.5 py-2 rounded-md text-sm transition-all duration-150',
              'hover:bg-accent/60 hover:text-accent-foreground',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              'text-foreground',
              !hasChildren && 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className="flex items-center gap-2">
              {category.imageId && <div className="w-4 h-4 bg-primary/20 rounded-sm flex-shrink-0" />}
              <span>{label}</span>
            </div>
          </button>
        </div>
        {isOpen && hasChildren && (
          <div className="ml-2 border-l-2 border-border/40 pl-0 mt-0.5 space-y-0.5">
            {category.children!.map((child) => (
              <TreeItem
                key={child._id}
                category={child}
                onSelect={onSelect}
                level={(level || 0) + 1}
                language={language}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
)
TreeItem.displayName = 'TreeItem'

export const TreeSelect = React.forwardRef<HTMLButtonElement, TreeSelectProps>(
  ({ categories, value, onValueChange, placeholder = 'Select...', language = 'uz' }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Helper function to normalize IDs
    const normalizeId = React.useCallback((id: any): string | null => {
      if (!id) return null
      if (typeof id === 'object' && id !== null) {
        if (id.$oid) return String(id.$oid)
        if (id.oid) return String(id.oid)
        if (id.toString && typeof id.toString === 'function') {
          const str = id.toString()
          if (str && str !== '[object Object]') return str
        }
        if (id.value) return String(id.value)
        return null
      }
      const strId = String(id)
      if (strId === 'null' || strId === 'undefined' || strId === '' || strId === '[object Object]') {
        return null
      }
      return strId
    }, [])

    const selectedCategory = React.useMemo(() => {
      const findCategory = (items: Category[]): Category | undefined => {
        for (const item of items) {
          // Normalize IDs for comparison
          const itemId = normalizeId(item._id)
          const searchId = normalizeId(value)
          if (itemId === searchId) return item
          if (item.children) {
            const found = findCategory(item.children)
            if (found) return found
          }
        }
        return undefined
      }
      return findCategory(categories)
    }, [categories, value, normalizeId])

    // Filter categories based on debounced search query
    // This function recursively searches through all categories and sub-categories
    const filterCategories = (items: Category[], query: string): Category[] => {
      if (!query) return items

      const queryLower = query.toLowerCase().trim()
      const filtered: Category[] = []

      for (const item of items) {
        const label = getCategoryLabel(item, language)
        const matchesSearch = label.toLowerCase().includes(queryLower)

        // Recursively filter children (sub-categories)
        const filteredChildren = item.children ? filterCategories(item.children, query) : []
        const hasMatchingChildren = filteredChildren.length > 0

        // Include category if it matches or has matching children
        if (matchesSearch || hasMatchingChildren) {
          filtered.push({
            ...item,
            // If there are filtered children, use them; otherwise keep original children structure
            children: hasMatchingChildren ? filteredChildren : (matchesSearch ? item.children : undefined),
          })
        }
      }
      return filtered
    }

    const filteredCategories = React.useMemo(() => {
      return filterCategories(categories, debouncedSearchQuery)
    }, [categories, debouncedSearchQuery, language])

    const handleSelect = (id: string) => {
      onValueChange?.(id)
      setSearchQuery('')
      setOpen(false) // Close dropdown after selection
    }

    const selectedLabel = selectedCategory ? getCategoryLabel(selectedCategory, language) : null

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              'w-full justify-between px-3 py-2 h-auto',
              'border-border/60 hover:border-border hover:bg-accent/30',
              'transition-colors duration-200',
            )}
          >
            <span className="truncate text-foreground">{selectedLabel || placeholder}</span>
            <ChevronDown className="size-4 opacity-50 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 p-0 shadow-lg border-border/60">
          <div className="sticky top-0 px-3 py-2 border-b border-border/40 bg-popover">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-8 pr-3 py-1.5 text-sm',
                  'bg-background border border-border/60 rounded-md',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring/50',
                  'transition-colors duration-150',
                )}
              />
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TreeItem
                  key={category._id}
                  category={category}
                  onSelect={handleSelect}
                  language={language}
                  searchQuery={debouncedSearchQuery}
                />
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Kategoriya topilmadi
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)
TreeSelect.displayName = 'TreeSelect'
