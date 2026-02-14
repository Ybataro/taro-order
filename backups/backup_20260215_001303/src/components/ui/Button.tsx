import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'font-semibold rounded-[8px] transition-colors duration-150 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-primary';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-dark-brown disabled:bg-border disabled:text-text-hint disabled:cursor-not-allowed',
    secondary: 'bg-secondary text-primary border border-accent hover:bg-accent/20 active:bg-accent/30',
    danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-[44px] px-6 text-base',
    lg: 'h-[52px] px-8 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
