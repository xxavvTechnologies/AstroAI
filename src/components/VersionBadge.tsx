import React from 'react';

interface VersionBadgeProps {
  version: string;
  className?: string;
}

const VersionBadge: React.FC<VersionBadgeProps> = ({ version, className = '' }) => {
  return (
    <span 
      className={`inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-200 transition-all hover:scale-105 version-badge-glow ${className}`}
      title={`Astro version ${version}`}
    >
      v{version}
    </span>
  );
};

export default VersionBadge;
