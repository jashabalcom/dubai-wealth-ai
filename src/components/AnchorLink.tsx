import React from 'react';

interface AnchorLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

export const AnchorLink = ({ to, children, className, offset = 100 }: AnchorLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector(to);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Update URL hash without triggering scroll
      window.history.pushState(null, '', to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
