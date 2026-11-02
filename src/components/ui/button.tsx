import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "emerald"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-emerald-600 text-white shadow hover:bg-emerald-700 hover:shadow-emerald-600/20 hover:shadow-lg",
      emerald:
        "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-600/25",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      ghost:
        "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-rose-600/20",
      link: "text-emerald-600 underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

