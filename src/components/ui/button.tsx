
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#5B8FB5] text-white hover:bg-[#517ba1] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
        destructive:
          "bg-[#E76A6A] text-white hover:bg-[#d45555] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
        outline:
          "border-2 border-[#A6BB8D] bg-white/50 text-[#3F4E4F] hover:bg-[#EAF1EE] shadow-sm hover:shadow transition-all",
        secondary:
          "bg-[#A6BB8D] text-[#3F4E4F] hover:bg-[#95aa7c] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
        ghost: "hover:bg-[#EAF1EE] hover:text-[#3F4E4F] transition-all",
        link: "text-[#5B8FB5] underline-offset-4 hover:underline",
        warning: "bg-[#F6C176] text-white hover:bg-[#e5af65] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
        success: "bg-[#94B49F] text-white hover:bg-[#83a38d] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        mobile: "h-9 px-3 py-1 text-xs md:h-10 md:px-4 md:py-2 md:text-sm", // New mobile-friendly size
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
