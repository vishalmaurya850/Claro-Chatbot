import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Source {
  title: string;
  content: string;
  score: number;
}

interface SourceDisplayProps {
  sources: Source[];
}

export function SourceDisplay({ sources }: SourceDisplayProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div key={index} className="source-item">
            <Badge variant="outline" className="text-xs">
              {source.title}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}