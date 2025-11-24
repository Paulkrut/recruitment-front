/**
 * TypeScript types for LinguiJS integration
 */

declare module '@lingui/loader!*' {
  export default any;
}

declare module '*.po' {
  const content: any;
  export default content;
}

// Расширяем типы Trans для поддержки children без обязательного id
// ВАЖНО: Теперь Trans импортируется из @lingui/macro, а не @lingui/react
declare module '@lingui/macro' {
  import * as React from 'react';
  
  export interface TransProps {
    id?: string;
    message?: string;
    values?: Record<string, unknown>;
    components?: {
      [key: string]: React.ElementType | any;
    };
    comment?: string;
    children?: React.ReactNode;
  }
  
  export const Trans: React.FC<TransProps>;
  
  export function msg(strings: TemplateStringsArray, ...values: any[]): any;
  export function t(id: string): string;
}

declare module '@lingui/react' {
  export const useLingui: () => {
    i18n: any;
    _: (descriptor: any) => string;
  };
}

