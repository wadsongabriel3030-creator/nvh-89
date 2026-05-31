import { Tag } from '@/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, size = 'md' }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium text-white transition-all',
        tag.color,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        onRemove && 'pr-1.5'
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <X className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
        </button>
      )}
    </span>
  );
}
