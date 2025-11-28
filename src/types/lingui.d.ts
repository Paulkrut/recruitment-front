// Type declarations for Lingui message catalogs loaded with @lingui/loader
// The loader compiles .po files on-the-fly during webpack/next build

declare module '@lingui/loader!*' {
  import { Messages } from '@lingui/core';
  const messages: Messages;
  export { messages };
}

// Support for different path patterns
declare module '@lingui/loader!../locales/*.po' {
  import { Messages } from '@lingui/core';
  const messages: Messages;
  export { messages };
}

declare module '@lingui/loader!../../locales/*.po' {
  import { Messages } from '@lingui/core';
  const messages: Messages;
  export { messages };
}

