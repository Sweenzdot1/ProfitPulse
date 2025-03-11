import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

interface Position {
  top: number;
  left: number;
  transform: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    transform: 'translate(-50%, 0)',
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const button = buttonRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Calculate optimal position
      let newPosition: Position = {
        top: button.bottom + 8,
        left: button.left + button.width / 2,
        transform: 'translate(-50%, 0)',
      };

      // Check horizontal boundaries
      if (newPosition.left - tooltip.width / 2 < 16) {
        newPosition.left = tooltip.width / 2 + 16;
      } else if (newPosition.left + tooltip.width / 2 > viewport.width - 16) {
        newPosition.left = viewport.width - tooltip.width / 2 - 16;
      }

      // Check if tooltip would go below viewport
      if (newPosition.top + tooltip.height > viewport.height - 16) {
        newPosition = {
          top: button.top - tooltip.height - 8,
          left: newPosition.left,
          transform: 'translate(-50%, 0)',
        };
      }

      setPosition(newPosition);
    }
  }, [isVisible]);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="More information"
      >
        <Info size={18} />
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: position.transform,
          }}
          className="z-50 w-64 p-3 text-sm text-left text-white bg-gray-800 rounded-lg shadow-lg"
        >
          <div className="relative">
            {text}
            <div 
              className="absolute w-2 h-2 bg-gray-800 transform rotate-45"
              style={{
                top: position.top > buttonRef.current?.getBoundingClientRect().top ? '-13px' : 'auto',
                bottom: position.top > buttonRef.current?.getBoundingClientRect().top ? 'auto' : '-13px',
                left: '50%',
                marginLeft: '-4px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}