/**
 * TypeScript types for LinguiJS integration
 */

declare module '@lingui/loader!*' {
  const messages: any;
  export { messages };
}

declare module '*.po' {
  const content: any;
  export default content;
}

// Расширяем типы Trans для поддержки children без обязательного id
declare module '@lingui/react' {
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
  export const useLingui: () => {
    i18n: any;
    _: (descriptor: any) => string;
  };
}

