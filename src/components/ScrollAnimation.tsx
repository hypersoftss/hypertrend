import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  threshold?: number;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getInitialStyles = () => {
    switch (animation) {
      case 'fade-up':
        return { opacity: 0, transform: 'translateY(40px)' };
      case 'fade-down':
        return { opacity: 0, transform: 'translateY(-40px)' };
      case 'fade-left':
        return { opacity: 0, transform: 'translateX(40px)' };
      case 'fade-right':
        return { opacity: 0, transform: 'translateX(-40px)' };
      case 'scale':
        return { opacity: 0, transform: 'scale(0.9)' };
      case 'fade':
      default:
        return { opacity: 0 };
    }
  };

  const getFinalStyles = () => {
    return { opacity: 1, transform: 'translate(0) scale(1)' };
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        ...(isVisible ? getFinalStyles() : getInitialStyles()),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
