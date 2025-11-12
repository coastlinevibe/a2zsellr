import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-[9px] text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
      outline: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900",
      link: "text-emerald-600 underline-offset-4 hover:underline",
    };

    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-[9px] px-3 text-xs",
      lg: "h-10 rounded-[9px] px-8",
      icon: "h-9 w-9",
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button className={classes} ref={ref} {...props} />
    );
  },
);

Button.displayName = "Button";

export { Button };
export default Button;
