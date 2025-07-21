import React from 'react';
import { cn } from '@/lib/utils';
import Guest from './guest';

export type TableType = 'round' | 'square' | 'rectangle';

interface GuestData {
  id: string;
  name: string;
  tag?: string;
  label?: string;
  avatar?: string;
}

interface TableProps {
  id: string;
  type: TableType;
  seats: number;
  guests?: (GuestData | null)[];
  tableName?: string;
  tableNumber?: number;
  isSelected?: boolean;
  onGuestClick?: (seatIndex: number, guest?: GuestData) => void;
  onTableClick?: () => void;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  id,
  type,
  seats,
  guests = [],
  tableName,
  tableNumber,
  isSelected = false,
  onGuestClick,
  onTableClick,
  className
}) => {
  const getTableSize = (seats: number, type: TableType) => {
    const baseSize = Math.max(120, Math.min(200, 80 + seats * 8));
    
    switch (type) {
      case 'round':
        return { width: baseSize, height: baseSize };
      case 'square':
        return { width: baseSize, height: baseSize };
      case 'rectangle':
        const width = baseSize * 1.4;
        const height = baseSize * 0.8;
        return { width, height };
      default:
        return { width: baseSize, height: baseSize };
    }
  };

  const getSeatPositions = (seats: number, type: TableType, tableSize: { width: number; height: number }) => {
    const positions: { x: number; y: number; angle: number }[] = [];
    const centerX = tableSize.width / 2;
    const centerY = tableSize.height / 2;
    
    switch (type) {
      case 'round': {
        const radius = (Math.min(tableSize.width, tableSize.height) / 2) + 35;
        for (let i = 0; i < seats; i++) {
          const angle = (i * 2 * Math.PI) / seats - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle) - 24;
          const y = centerY + radius * Math.sin(angle) - 24;
          positions.push({ x, y, angle: angle + Math.PI / 2 });
        }
        break;
      }
      
      case 'square': {
        const seatsPerSide = Math.ceil(seats / 4);
        const sideLength = Math.min(tableSize.width, tableSize.height);
        const spacing = sideLength / (seatsPerSide + 1);
        const offset = 35;
        
        let seatIndex = 0;
        
        // Top side
        for (let i = 1; i <= seatsPerSide && seatIndex < seats; i++, seatIndex++) {
          positions.push({
            x: centerX - sideLength/2 + i * spacing - 24,
            y: centerY - sideLength/2 - offset - 24,
            angle: 0
          });
        }
        
        // Right side
        for (let i = 1; i <= seatsPerSide && seatIndex < seats; i++, seatIndex++) {
          positions.push({
            x: centerX + sideLength/2 + offset - 24,
            y: centerY - sideLength/2 + i * spacing - 24,
            angle: Math.PI / 2
          });
        }
        
        // Bottom side
        for (let i = seatsPerSide; i >= 1 && seatIndex < seats; i--, seatIndex++) {
          positions.push({
            x: centerX - sideLength/2 + i * spacing - 24,
            y: centerY + sideLength/2 + offset - 24,
            angle: Math.PI
          });
        }
        
        // Left side
        for (let i = seatsPerSide; i >= 1 && seatIndex < seats; i--, seatIndex++) {
          positions.push({
            x: centerX - sideLength/2 - offset - 24,
            y: centerY - sideLength/2 + i * spacing - 24,
            angle: -Math.PI / 2
          });
        }
        break;
      }
      
      case 'rectangle': {
        const longSide = Math.ceil(seats / 2);
        const shortSide = Math.floor(seats / 2);
        
        const longSpacing = tableSize.width / (longSide + 1);
        const offset = 35;
        
        let seatIndex = 0;
        
        // Top side
        for (let i = 1; i <= longSide && seatIndex < seats; i++, seatIndex++) {
          positions.push({
            x: i * longSpacing - 24,
            y: -offset - 24,
            angle: 0
          });
        }
        
        // Bottom side
        for (let i = longSide; i >= 1 && seatIndex < seats; i--, seatIndex++) {
          positions.push({
            x: i * longSpacing - 24,
            y: tableSize.height + offset - 24,
            angle: Math.PI
          });
        }
        
        break;
      }
    }
    
    return positions;
  };

  const tableSize = getTableSize(seats, type);
  const seatPositions = getSeatPositions(seats, type, tableSize);

  const getTableShape = () => {
    switch (type) {
      case 'round':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'rectangle':
        return 'rounded-xl';
      default:
        return 'rounded-lg';
    }
  };

  const getTableGradient = () => {
    switch (type) {
      case 'round':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      case 'square':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100';
      case 'rectangle':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  return (
    <div
      className={cn(
        "relative inline-block cursor-pointer group",
        className
      )}
      onClick={onTableClick}
      style={{ width: tableSize.width + 140, height: tableSize.height + 140 }}
    >
      {/* Table Surface */}
      <div
        className={cn(
          "absolute border-2 shadow-lg transition-all duration-200",
          getTableShape(),
          getTableGradient(),
          isSelected 
            ? "border-primary shadow-xl scale-105" 
            : "border-gray-300 group-hover:border-gray-400 group-hover:shadow-xl"
        )}
        style={{
          width: tableSize.width,
          height: tableSize.height,
          left: 70,
          top: 70
        }}
      >
        {/* Table Center Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {tableNumber && (
              <div className="text-lg font-bold text-gray-700">
                {tableNumber}
              </div>
            )}
            {tableName && (
              <div className="text-sm text-gray-600 mt-1">
                {tableName}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {seats} seats
            </div>
          </div>
        </div>
      </div>

      {/* Seats */}
      {seatPositions.map((position, index) => {
        const guest = guests[index];
        
        return (
          <div
            key={`seat-${index}`}
            className="absolute"
            style={{
              left: position.x + 70,
              top: position.y + 70,
            }}
          >
            {guest ? (
              <Guest
                id={guest.id}
                name={guest.name}
                tag={guest.tag}
                label={guest.label}
                avatar={guest.avatar}
                onClick={() => onGuestClick?.(index, guest)}
              />
            ) : (
              <Guest
                id={`empty-${index}`}
                name=""
                isEmpty={true}
                onClick={() => onGuestClick?.(index)}
              />
            )}
          </div>
        );
      })}

      {/* Selection Ring */}
      {isSelected && (
        <div
          className="absolute border-4 border-primary border-dashed rounded-full animate-pulse"
          style={{
            width: tableSize.width + 20,
            height: tableSize.height + 20,
            left: 60,
            top: 60
          }}
        />
      )}
    </div>
  );
};

export default Table;
