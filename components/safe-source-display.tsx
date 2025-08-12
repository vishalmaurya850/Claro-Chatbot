import React from 'react';

// This component can safely render anything, even if sources are objects
export function SafeSourceDisplay({ source }: { source: any }) {
  // If source is an object, render its properties separately
  if (source && typeof source === 'object') {
    return (
      <div className="source-item">
        <div className="source-title">{source.title || ''}</div>
        <div className="source-content">{source.content || ''}</div>
      </div>
    );
  }
  
  // If source is a string or any other type, render as string
  return <div>{String(source || '')}</div>;
}
