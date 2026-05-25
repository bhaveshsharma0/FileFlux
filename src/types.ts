export type ToolFeature = 'convert' | 'compress' | 'resize' | 'merge' | 'split';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  previewUrl?: string; // For images
  progress?: number;   // 0 - 100
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  resultUrl?: string;   // URL to download result
  resultName?: string;  // Name of the resulting file
  resultSize?: number;  // Size of the resulting file
}

export type ImageOutputFormat = 'jpeg' | 'png' | 'webp';

export interface ImageConvertOptions {
  format: ImageOutputFormat;
  quality: number; // 0.1 - 1.0
  rotate: number;  // 0, 90, 180, 270 degrees
  flipHorizontal: boolean;
  flipVertical: boolean;
  grayscale: boolean;
  invert: boolean;
  resizeWidth?: number;
  resizeHeight?: number;
  maintainAspectRatio: boolean;
}

export interface DocumentConvertOptions {
  format: 'json' | 'csv' | 'xml' | 'md' | 'html' | 'pdf' | 'txt';
  csvSeparator?: string;
  jsonWhitespace?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is my file safe with you?",
    answer: "Yes, 100% safe. Your files never go to the internet. All the work happens inside your own web browser on your computer or phone. Nobody else can ever see your files."
  },
  {
    question: "Do I have to pay anything?",
    answer: "No, it is completely free. There are no limits, no signup pages, and no hidden costs."
  },
  {
    question: "Does it work without internet?",
    answer: "Yes! Once you open the website in your browser, you can turn off your internet, and it will keep working perfectly."
  },
  {
    question: "How large can my files be?",
    answer: "Since everything runs on your computer's memory, you can convert very large files. If a file is extremely big, it might make your phone or browser slow down slightly while working, which is normal."
  },
  {
    question: "Why did you build this?",
    answer: "Other converters force you to upload your files, which takes a long time and is bad for privacy. We wanted a tool that is fast, safe, and completely private."
  },
  {
    question: "What files can I convert?",
    answer: "You can convert images (like JPG, PNG, WEBP), text files (like TXT, JSON, CSV), and document files (like PDF)."
  },
  {
    question: "Does it track my history or cookies?",
    answer: "No, we do not track you. We do not use passwords, accounts, or save any info about your files."
  },
  {
    question: "How do I download the result?",
    answer: "Once our helper is done, a green window will show up. Simply click the Download button to save the file back onto your device."
  }
];

export const SUPPORTED_BADGES: string[] = [
  "JPG", "PNG", "PDF", "MP3", "MP4", "DOCX", "ZIP", "XLSX", "WEBP", "GIF", "WAV", "MOV", "CSV", "JSON", "TXT", "XML", "HTML"
];
