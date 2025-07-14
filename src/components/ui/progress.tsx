import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden rounded-full bg-gray-200", className)}
        {...props}
      >
        <div
          className="h-2 w-full flex-none transition-all duration-300 ease-in-out bg-gradient-to-r from-pink-500 to-purple-500"
          style={{ width: `${percentage}%` }}
        />
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 