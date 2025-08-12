import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Source {
  title: string;
  content: string;
  score: number;
}

interface MessageSourcesProps {
  sources: Source[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="message-sources mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-muted-foreground mb-1">Sources:</p>
      <div className="flex flex-wrap gap-1">
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
