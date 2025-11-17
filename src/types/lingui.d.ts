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


