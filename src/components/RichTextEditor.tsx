'use client';

import React, { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import ReactDOM from 'react-dom';

// Полифил для findDOMNode в React 19
if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!ReactDOM.findDOMNode) {
    // @ts-ignore
    ReactDOM.findDOMNode = (node: any) => {
      if (node == null) return null;
      if (node.nodeType === 1) return node;
      // Возвращаем сам элемент, если это DOM node
      return node;
    };
  }
}

// Динамический импорт ReactQuill
const ReactQuill = dynamic(
  () => import('react-quill'),
  { 
    ssr: false,
    loading: () => <Box sx={{ height: 200, backgroundColor: '#f7f7f7', borderRadius: 2 }} />
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Оптимизация: мемоизация стилей
const editorStyles = {
  '& .quill': { backgroundColor: '#f7f7f7', borderRadius: 2 },
  '& .ql-toolbar': { 
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8, 
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0'
  },
  '& .ql-container': { 
    borderBottomLeftRadius: 8, 
    borderBottomRightRadius: 8, 
    minHeight: 200, 
    fontSize: '16px',
    border: '1px solid #e0e0e0',
    borderTop: 'none'
  },
  '& .ql-editor': {
    minHeight: 200,
    fontSize: '16px',
    lineHeight: '1.6'
  }
};

// Оптимизация: конфигурация toolbar вынесена наружу
const toolbarConfig = [
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link'],
  ['clean']
];

const RichTextEditor = React.memo(({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Синхронизируем localValue с внешним value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Оптимизация: мемоизация modules
  const modules = useMemo(() => ({
    toolbar: toolbarConfig
  }), []);

  // Дебаунс для onChange - обновляем родителя только через 300мс после остановки печати
  const handleChange = useCallback((content: string) => {
    setLocalValue(content);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      onChange(content);
    }, 300);
  }, [onChange]);

  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://cdn.quilljs.com/1.3.6/quill.snow.css');
      `}</style>
      <Box sx={editorStyles}>
        <ReactQuill
          value={localValue}
          onChange={handleChange}
          modules={modules}
          placeholder={placeholder}
        />
      </Box>
    </>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;

