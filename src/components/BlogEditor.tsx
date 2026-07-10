import React, { useRef, useState } from 'react';
import { Bold, Italic, Heading2, Quote, List, Code, Eye, Edit3 } from 'lucide-react';

interface BlogEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = openTag + (selection || '') + closeTag;

    const newValue =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + (selection || '').length);
    }, 0);
  };

  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
      {/* Editor/Preview tabs */}
      <div className="flex justify-between items-center bg-surface-container px-4 py-2 border-b border-outline-variant/20">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
              !isPreview
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
              isPreview
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Formatting Toolbar */}
        {!isPreview && (
          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => insertTag('<b>', '</b>')}
              title="Bold"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<i>', '</i>')}
              title="Italic"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<h2>', '</h2>')}
              title="Heading 2"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<blockquote>', '</blockquote>')}
              title="Quote"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
              title="Bullet List"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<code>', '</code>')}
              title="Code Block"
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="p-4">
        {isPreview ? (
          <div
            className="prose prose-sm max-w-none text-on-surface min-h-[160px] max-h-[300px] overflow-y-auto outline-none"
            dangerouslySetInnerHTML={{ __html: value || '<p className="text-on-surface-variant/50">Nothing to preview yet...</p>' }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            placeholder={placeholder || 'Start writing article content... (HTML tags supported)'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="w-full bg-transparent border-none outline-none text-label-md text-on-surface placeholder:text-on-surface-variant/40 resize-y min-h-[160px]"
          />
        )}
      </div>
    </div>
  );
}
