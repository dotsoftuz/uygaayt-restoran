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

export type TreeNode = {
    id: string
    label: string
    children?: TreeNode[]
}

interface TreeSelectProps {
    nodes: TreeNode[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
}

interface TreeItemProps {
    node: TreeNode
    onSelect: (id: string) => void
    level?: number
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
    ({ node, onSelect, level = 0 }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const hasChildren = node.children && node.children.length > 0

        return (
            <div ref={ref}>
                <div className="flex items-center gap-1 group">
                    {hasChildren && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                'p-1 flex-shrink-0 transition-all duration-200 hover:bg-accent/50 rounded-md',
                                isOpen && 'rotate-90'
                            )}
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                        >
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                    )}
                    {!hasChildren && <div className="w-6 flex-shrink-0" />}
                    <button
                        onClick={() => onSelect(node.id)}
                        className={cn(
                            'flex-1 text-left px-2.5 py-2 rounded-md text-sm transition-all duration-150',
                            'hover:bg-accent/60 hover:text-accent-foreground',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            'text-foreground',
                            !hasChildren && 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {node.label}
                    </button>
                </div>
                {isOpen && hasChildren && (
                    <div className="ml-2 border-l-2 border-border/40 pl-0 mt-0.5 space-y-0.5">
                        {node.children!.map((child) => (
                            <TreeItem
                                key={child.id}
                                node={child}
                                onSelect={onSelect}
                                level={(level || 0) + 1}
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
    ({ nodes, value, onValueChange, placeholder = 'Select...' }, ref) => {
        const [searchQuery, setSearchQuery] = React.useState('')

        const selectedNode = React.useMemo(() => {
            const findNode = (items: TreeNode[]): TreeNode | undefined => {
                for (const item of items) {
                    if (item.id === value) return item
                    if (item.children) {
                        const found = findNode(item.children)
                        if (found) return found
                    }
                }
                return undefined
            }
            return findNode(nodes)
        }, [nodes, value])

        // Filter nodes based on search query
        const filterNodes = (items: TreeNode[], query: string): TreeNode[] => {
            if (!query) return items;
            
            const filtered: TreeNode[] = [];
            for (const item of items) {
                const matchesSearch = item.label.toLowerCase().includes(query.toLowerCase());
                const filteredChildren = item.children ? filterNodes(item.children, query) : [];
                const hasMatchingChildren = filteredChildren.length > 0;
                
                if (matchesSearch || hasMatchingChildren) {
                    filtered.push({
                        ...item,
                        children: filteredChildren.length > 0 ? filteredChildren : item.children,
                    });
                }
            }
            return filtered;
        };

        const filteredNodes = React.useMemo(() => {
            return filterNodes(nodes, searchQuery);
        }, [nodes, searchQuery]);

        const handleSelect = (id: string) => {
            onValueChange?.(id)
            setSearchQuery('')
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        className={cn(
                            'w-full justify-between px-3 py-2 h-auto',
                            'border-border/60 hover:border-border hover:bg-accent/30',
                            'transition-colors duration-200'
                        )}
                    >
                        <span className="truncate text-foreground">
                            {selectedNode?.label || placeholder}
                        </span>
                        <ChevronDown className="size-4 opacity-50 flex-shrink-0 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56 p-0 shadow-lg border-border/60"
                >
                    <div className="sticky top-0 px-3 py-2 border-b border-border/40 bg-popover">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    'w-full pl-8 pr-3 py-1.5 text-sm',
                                    'bg-background border border-border/60 rounded-md',
                                    'placeholder:text-muted-foreground',
                                    'focus:outline-none focus:ring-2 focus:ring-ring/50',
                                    'transition-colors duration-150'
                                )}
                            />
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
                        {filteredNodes.length > 0 ? (
                            filteredNodes.map((node) => (
                                <TreeItem
                                    key={node.id}
                                    node={node}
                                    onSelect={handleSelect}
                                />
                            ))
                        ) : (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                No items available
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    },
)
TreeSelect.displayName = 'TreeSelect'
