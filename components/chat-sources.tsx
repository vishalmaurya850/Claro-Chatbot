import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Source {
  title: string;
  content: string;
  score: number;
  display?: string;
  key?: string;
}

interface ChatSourcesProps {
  sources: Source[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 mb-1">Sources:</p>
      <div className="flex flex-wrap gap-1">
        {sources.map((source, index) => (
          <Badge key={source.key || index} variant="outline" className="text-xs">
            {source.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}
