import React from "react";

interface SkipLinkProps {
  href?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href = "#site-main" }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed top-2 left-2 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
