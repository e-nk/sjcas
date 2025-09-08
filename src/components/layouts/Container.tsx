import { ReactNode } from 'react';

type ContainerVariant = 'default' | 'full' | 'fluid' | 'boxed' | 'section';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: ContainerVariant;
  noPadding?: boolean;
  noMargin?: boolean;
  as?: React.ElementType;
}

export default function Container({ 
  children, 
  className = '',
  variant = 'default',
  noPadding = false,
  noMargin = false,
  as: Component = 'div'
}: ContainerProps) {
  
  // Base styles
  let containerStyles = '';
  
  // Apply different styles based on variant
  switch(variant) {
    case 'full':
      // Full width container with minimal padding
      containerStyles = 'w-full px-4 sm:px-6 md:px-8';
      break;
    case 'fluid':
      // Fluid width with larger side margins at larger screens
      containerStyles = 'w-full mx-auto px-[20px] sm:px-[30px] lg:px-[40px] xl:px-[60px] 2xl:px-[80px]';
      break;
    case 'boxed':
      // Boxed content with background and shadow
      containerStyles = 'max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8';
      break;
    case 'section':
      // Section container with vertical padding
      containerStyles = 'w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24';
      break;
    default:
      // Standard container with max width and auto margins
      containerStyles = 'max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8';
  }
  
  // Apply additional modifier classes
  if (noPadding) {
    containerStyles = containerStyles.replace(/px-\[?\d+\]?|px-\d+|py-\d+|p-\d+/g, '');
  }
  
  if (noMargin) {
    containerStyles = containerStyles.replace(/mx-auto|my-\d+|m-\d+/g, '');
  }
  
  // For boxed variant with padding
  const boxedContent = variant === 'boxed' ? 
    `${noPadding ? '' : 'p-4 sm:p-6 md:p-8'} bg-white rounded-lg shadow-md overflow-hidden` : '';
  
  return (
    <Component className={`${containerStyles} ${className}`}>
      {variant === 'boxed' ? (
        <div className={boxedContent}>
          {children}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}