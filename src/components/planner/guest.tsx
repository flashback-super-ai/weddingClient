import React from 'react';
import { cn } from '@/lib/utils';

interface GuestProps {
  id: string;
  name: string;
  tag?: string;
  label?: string;
  avatar?: string;
  isSelected?: boolean;
  isEmpty?: boolean;
  onClick?: () => void;
  className?: string;
}

const Guest: React.FC<GuestProps> = ({
  id,
  name,
  tag,
  label,
  avatar,
  isSelected = false,
  isEmpty = false,
  onClick,
  className
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTagColor = (tag?: string) => {
    if (!tag) return '';
    
    const tagColors: Record<string, string> = {
      'groom': 'bg-blue-100 text-blue-800 border-blue-200',
      'bride': 'bg-pink-100 text-pink-800 border-pink-200',
      'family': 'bg-green-100 text-green-800 border-green-200',
      'friends': 'bg-purple-100 text-purple-800 border-purple-200',
      'work': 'bg-orange-100 text-orange-800 border-orange-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return tagColors[tag.toLowerCase()] || tagColors.default;
  };

  if (isEmpty) {
    return (
      <div
        className={cn(
          "w-12 h-12 rounded-full border-2 border-dashed border-gray-300",
          "flex items-center justify-center cursor-pointer",
          "hover:border-gray-400 transition-colors",
          "bg-gray-50/50",
          className
        )}
        onClick={onClick}
      >
        <span className="text-gray-400 text-xs">+</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      {/* Guest Circle */}
      <div
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center",
          "transition-all duration-200 shadow-sm",
          isSelected 
            ? "border-primary bg-primary text-primary-foreground shadow-md scale-105" 
            : "border-gray-300 bg-card hover:border-gray-400 hover:shadow-md hover:scale-105"
        )}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span 
            className={cn(
              "text-xs font-medium",
              isSelected ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {getInitials(name)}
          </span>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border min-w-max">
          <div className="font-medium text-sm">{name}</div>
          {tag && (
            <div className={cn(
              "inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1",
              getTagColor(tag)
            )}>
              {tag}
            </div>
          )}
          {label && (
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="border-4 border-transparent border-t-popover"></div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Guest;
