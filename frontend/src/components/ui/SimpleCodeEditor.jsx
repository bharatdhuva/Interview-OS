import React, { useRef } from 'react';

export default function SimpleCodeEditor({ value, onChange, language = 'javascript', style = {}, ...props }) {
  const textareaRef = useRef();
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      style={{
        fontFamily: 'Fira Mono, monospace',
        fontSize: 15,
        background: '#18181b',
        color: '#f4f4f5',
        borderRadius: 8,
        padding: 12,
        minHeight: 180,
        width: '100%',
        resize: 'vertical',
        ...style,
      }}
      {...props}
    />
  );
}
