import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'min-w-full divide-y divide-gray-300',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx('bg-gray-50', className)} {...props} />;
}

export function Tbody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx('divide-y divide-gray-200 bg-white', className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        'px-3 py-3.5 text-left text-sm font-semibold text-gray-900',
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx(
        'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
        className
      )}
      {...props}
    />
  );
}