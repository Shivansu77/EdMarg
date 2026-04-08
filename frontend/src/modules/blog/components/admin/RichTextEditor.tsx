'use client';

import { useEffect, useRef } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

type ToolbarButton = {
  label: string;
  command: string;
  value?: string;
};

const toolbarButtons: ToolbarButton[] = [
  { label: 'B', command: 'bold' },
  { label: 'I', command: 'italic' },
  { label: 'H2', command: 'formatBlock', value: 'h2' },
  { label: 'H3', command: 'formatBlock', value: 'h3' },
  { label: 'UL', command: 'insertUnorderedList' },
  { label: 'OL', command: 'insertOrderedList' },
];

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (!url) {
      return;
    }
    runCommand('createLink', url);
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3">
        {toolbarButtons.map((button) => (
          <button
            key={`${button.command}-${button.label}`}
            type="button"
            onClick={() => runCommand(button.command, button.value)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          onClick={insertLink}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Link
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-70 w-full p-4 text-sm leading-7 text-gray-900 outline-none"
      />
    </div>
  );
}
