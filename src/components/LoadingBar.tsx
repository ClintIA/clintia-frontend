"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingBarProps extends React.HTMLAttributes<HTMLDivElement> {
    progress?: number
    height?: number
    color?: string
    indeterminate?: boolean
    className?: string
}

export function LoadingBar({
                               progress = 0,
                               height = 4,
                               color,
                               indeterminate = false,
                               className,
                               ...props
                           }: LoadingBarProps) {
    const [value, setValue] = React.useState(progress)

    React.useEffect(() => {
        setValue(progress)
    }, [progress])

    React.useEffect(() => {
        if (indeterminate) {
            const interval = setInterval(() => {
                setValue((prev) => {
                    if (prev >= 100) {
                        return 0
                    }
                    return prev + 3
                })
            }, 10)
            return () => clearInterval(interval)
        }
    }, [indeterminate])

    return (
        <div className={cn("w-full overflow-hidden rounded-full bg-muted", className)} style={{ height }} {...props}>
            <div
                className={cn("h-full transition-all duration-300 ease-in-out animate-loading-bar")}
                style={{
                    width: `${value}%`,
                    backgroundColor: color || "var(--primary)",
                }}
            />
        </div>
    )
}

