import React from 'react';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: boolean;
  className?: string;
}

export default function Card({
  children,
  header,
  footer,
  padding = true,
  className = '',
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">{header}</div>
      )}
      <div className={padding ? 'px-6 py-4' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
