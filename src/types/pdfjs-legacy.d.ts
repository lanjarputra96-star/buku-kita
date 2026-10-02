// pdf.js build legacy tidak menyertakan deklarasi TypeScript; tipe sudah
// dilemaskan manual di ebook-reader.tsx.
declare module "pdfjs-dist/legacy/build/pdf.min.mjs";
declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
