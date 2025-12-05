import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:from-primary/90 hover:to-primary rounded-xl",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-md hover:shadow-lg rounded-xl",
        outline:
          "border border-border/60 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-secondary/50 hover:border-border rounded-xl",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary rounded-xl",
        ghost:
          "hover:bg-secondary/60 hover:text-accent-foreground rounded-xl",
        link:
          "text-primary underline-offset-4 hover:underline",
        // New ethereal variants
        amber:
          "bg-gradient-to-r from-amber/90 to-amber hover:from-amber hover:to-amber-glow text-primary-foreground shadow-md hover:shadow-glow-amber rounded-xl",
        teal:
          "bg-gradient-to-r from-teal/90 to-teal hover:from-teal hover:to-teal-glow text-primary-foreground shadow-md hover:shadow-glow-teal rounded-xl",
        violet:
          "bg-gradient-to-r from-violet/90 to-violet hover:from-violet hover:to-violet-glow text-white shadow-md hover:shadow-glow-violet rounded-xl",
        glass:
          "bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm hover:bg-card/80 hover:border-border/70 rounded-xl",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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
