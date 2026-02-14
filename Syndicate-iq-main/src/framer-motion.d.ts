import 'framer-motion';
import React from 'react';

declare module 'framer-motion' {
  export interface MotionProps {
    className?: string;
    onClick?: React.MouseEventHandler | ((e?: React.MouseEvent) => void);
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
    disabled?: boolean;
  }
  
  export interface HTMLAttributesWithoutMotionProps<T, V> {
    className?: string;
    onClick?: React.MouseEventHandler | ((e?: React.MouseEvent) => void);
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
    disabled?: boolean;
  }
}
