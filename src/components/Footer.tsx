import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 My Aura 2.0. All rights reserved.
          </p>
          <p className="flex items-center text-sm text-muted-foreground mt-2 md:mt-0">
            Made with <Heart className="mx-1 h-4 w-4 text-red-500" /> for mental health
          </p>
        </div>
      </div>
    </footer>
  );
}