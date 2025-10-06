// import { forwardRef, useEffect, useRef } from 'react';
// // import { Spinner } from '../../../misc/Spinner';
// // import { ButtonProps } from '../types';
// // import { Styled } from './Button.styles';

// /**
//  * A reusable Button component with support for:
//  * - Loading state
//  * - Icon rendering
//  * - Accessibility labels
//  * - Variants, shapes, and custom classes
//  */
// export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       children,
//       type = 'button',
//       variant = 'primary',
//       isLoading,
//       accessibilityLabel,
//       icon,
//       shape = 'default',
//       className,
//       ...other
//     },
//     ref
//   ): JSX.Element => {
//     const buttonRef = useRef<HTMLButtonElement | null>(null);
//     const contentRef = useRef<HTMLSpanElement | null>(null);

//     // Ensure the contentRef is updated when children change
//     useEffect(() => {
//       if (contentRef.current) {
//         contentRef.current.textContent = children?.toString() || '';
//       }
//     }, [children]);

//     return (
//       <Styled.Button
//         ref={node => {
//           if (typeof ref === 'function') {
//             ref(node);
//           } else if (ref) {
//             ref.current = node;
//           }
//           buttonRef.current = node;
//         }}
//         type={type}
//         $variant={variant}
//         $shape={shape}
//         $isLoading={isLoading}
//         disabled={isLoading}
//         aria-label={accessibilityLabel || children?.toString()}
//         className={`${className || ''}`.trim()}
//         {...other}
//       >
//         {icon ? <>{icon}</> : null}
//         {isLoading ? <Spinner /> : null}
//         {children ? (
//           <span className="content" ref={contentRef}>
//             {children}
//           </span>
//         ) : null}
//       </Styled.Button>
//     );
//   }
// );

// Button.displayName = 'Button';
