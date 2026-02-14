/// <reference types="vite/client" />

// Type declaration for PDF.js worker import
declare module 'pdfjs-dist/build/pdf.worker?url' {
  const src: string;
  export default src;
}
