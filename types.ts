import React from 'react';

export type AssetType = 'IMAGE' | 'VIDEO' | 'LINK' | 'TWEET' | 'NOTE' | 'PDF';

export interface MindAsset {
  id: string;
  type: AssetType;
  content: string; // URL for media/links, text for notes
  title?: string; // Optional title/filename
  thumbnail?: string; // For videos or link previews
  metadata?: {
    author?: string;
    domain?: string;
    description?: string;
    dimensions?: { width: number; height: number };
    fileSize?: number;
    mimeType?: string;
    // Note styling
    textAlign?: 'left' | 'center' | 'right';
    fontSize?: 'sm' | 'md' | 'lg';
    fontFamily?: 'sans' | 'serif';
    // Allow for other dynamic metadata properties
    [key: string]: any;
  };
  aspectRatio: number; // For masonry layout
  tags: string[]; // Re-using tags/notes concept
  addedAt: number;
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isBeta?: boolean;
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
    webkitdirectory?: string | boolean;
    directory?: string | boolean;
  }
}