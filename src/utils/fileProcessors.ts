import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ImageConvertOptions, DocumentConvertOptions } from '../types';

/**
 * Loads a File object into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 1. Image Conversion with canvas effects
 */
export async function convertImage(
  file: File,
  options: ImageConvertOptions
): Promise<{ blob: Blob; url: string; ext: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // Determine size
  let width = options.resizeWidth || img.width;
  let height = options.resizeHeight || img.height;

  if (options.maintainAspectRatio && options.resizeWidth && !options.resizeHeight) {
    const ratio = img.height / img.width;
    height = Math.round(width * ratio);
  } else if (options.maintainAspectRatio && options.resizeHeight && !options.resizeWidth) {
    const ratio = img.width / img.height;
    width = Math.round(height * ratio);
  }

  // Handle Rotation Dimensions swap
  const normalizeRotation = (options.rotate % 360 + 360) % 360;
  const is90or270 = normalizeRotation === 90 || normalizeRotation === 270;
  
  canvas.width = is90or270 ? height : width;
  canvas.height = is90or270 ? width : height;

  // Set translation and rotation logic
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Apply rotation
  ctx.rotate((normalizeRotation * Math.PI) / 180);

  // Apply scales for flip
  const scaleX = options.flipHorizontal ? -1 : 1;
  const scaleY = options.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Filters (Grayscale, Invert)
  let filters: string[] = [];
  if (options.grayscale) filters.push('grayscale(100%)');
  if (options.invert) filters.push('invert(100%)');
  ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';

  // Draw image centered
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();

  // Convert to target MIME Type
  let mimeType = 'image/png';
  let ext = 'png';
  if (options.format === 'jpeg') {
    mimeType = 'image/jpeg';
    ext = 'jpg';
  } else if (options.format === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to output canvas to blob'));
          return;
        }
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          ext
        });
      },
      mimeType,
      options.quality
    );
  });
}

/**
 * 2. Image Compression
 */
export async function compressImage(
  file: File,
  qualityPercent: number, // 10 to 100
  resizePercent: number  // 20 to 100
): Promise<{ blob: Blob; url: string; originalSize: number; newSize: number; scaleFactor: number }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context error');
  }

  const scale = resizePercent / 100;
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  // Prefer webp or jpeg for compressing, if input is png, convert to jpeg/webp for actually smaller output
  let targetMime = 'image/jpeg';
  if (file.type === 'image/webp' || file.name.endsWith('.webp')) {
    targetMime = 'image/webp';
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Compression failed'));
          return;
        }
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          originalSize: file.size,
          newSize: blob.size,
          scaleFactor: scale
        });
      },
      targetMime,
      qualityPercent / 100
    );
  });
}

/**
 * 3. Text & Data Document Converters
 */
export async function convertTextDocument(
  file: File,
  options: DocumentConvertOptions
): Promise<{ content: string; blob: Blob; url: string; ext: string }> {
  const text = await file.text();
  let resultText = '';
  let ext = options.format;
  let mimeType = 'text/plain';

  if (options.format === 'json') {
    mimeType = 'application/json';
    // If input is CSV
    if (file.name.endsWith('.csv') || file.type.includes('csv')) {
      const rows = parseCSV(text, options.csvSeparator || ',');
      resultText = options.jsonWhitespace ? JSON.stringify(rows, null, 2) : JSON.stringify(rows);
    } else if (file.name.endsWith('.xml') || text.trim().startsWith('<')) {
      const parsedXml = parseXMLToJSON(text);
      resultText = options.jsonWhitespace ? JSON.stringify(parsedXml, null, 2) : JSON.stringify(parsedXml);
    } else if (file.name.endsWith('.md')) {
      // Just wrap markdown lines in a json object
      resultText = JSON.stringify({ markdown: text, convertedAt: new Date().toISOString() });
    } else {
      // General TXT lines to JSON
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      resultText = JSON.stringify({ lines, file: file.name }, null, 2);
    }
  } 
  
  else if (options.format === 'csv') {
    mimeType = 'text/csv';
    const separator = options.csvSeparator || ',';
    // If input is JSON
    if (file.name.endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
      try {
        const json = JSON.parse(text);
        resultText = convertJSONToCSV(json, separator);
      } catch (err) {
        throw new Error('Invalid JSON format for CSV conversion. Must be an array of objects.');
      }
    } else {
      // Just return as CSV
      resultText = text;
    }
  } 
  
  else if (options.format === 'xml') {
    mimeType = 'application/xml';
    if (file.name.endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
      try {
        const json = JSON.parse(text);
        resultText = convertJSONToXML(json);
      } catch (err) {
        throw new Error('Invalid JSON. Could not convert to XML.');
      }
    } else {
      resultText = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${text}</root>`;
    }
  } 
  
  else if (options.format === 'md') {
    mimeType = 'text/markdown';
    if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      resultText = convertHTMLToMarkdown(text);
    } else {
      resultText = `# ${file.name.replace(/\.[^/.]+$/, "")}\n\n\`\`\`text\n${text}\n\`\`\``;
    }
  } 
  
  else if (options.format === 'html') {
    mimeType = 'text/html';
    if (file.name.endsWith('.md')) {
      resultText = convertMarkdownToHTML(text);
    } else {
      resultText = `<!DOCTYPE html><html><head><title>${file.name}</title></head><body><pre>${text}</pre></body></html>`;
    }
  } 
  
  else if (options.format === 'pdf') {
    // Generate actual PDF from text
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.276, 841.890]); // A4 Size
    const { width, height } = page.getSize();
    
    // Simple text wrapping and draw
    const lines = text.split(/\r?\n/);
    const fontSize = 10;
    const margin = 50;
    let y = height - margin;
    const leading = 14;

    page.drawText(`Document: ${file.name}`, { x: margin, y: y, size: 14 });
    y -= 25;
    page.drawText(`Converted on ${new Date().toLocaleDateString()}`, { x: margin, y: y, size: 8 });
    y -= 30;

    for (const line of lines) {
      if (y < margin + 20) {
        page = pdfDoc.addPage([595.276, 841.890]);
        y = height - margin;
      }
      // Chunk line if too long for safety
      const cleanLine = line.substring(0, 100); 
      page.drawText(cleanLine, { x: margin, y: y, size: fontSize });
      y -= leading;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return {
      content: 'PDF elements compiled dynamically.',
      blob,
      url: URL.createObjectURL(blob),
      ext: 'pdf'
    };
  }

  const blob = new Blob([resultText], { type: mimeType });
  return {
    content: resultText,
    blob,
    url: URL.createObjectURL(blob),
    ext
  };
}

/**
 * 4. Merge multiple PDFs
 */
export async function mergePDFs(files: File[]): Promise<{ blob: Blob; url: string }> {
  if (files.length === 0) {
    throw new Error('No files provided for merging');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return {
    blob,
    url: URL.createObjectURL(blob)
  };
}

/**
 * 5. Images to Multi-page PDF
 */
export async function convertImagesToPDF(files: File[]): Promise<{ blob: Blob; url: string }> {
  if (files.length === 0) {
    throw new Error('No files provided');
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const isPng = file.type === 'image/png' || file.name.endsWith('.png');
    const arrayBuffer = await file.arrayBuffer();
    
    // We create page with size based on image or fit to standard A4 (595 x 842 points)
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // JPEG supports JPG / JPEG
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    }

    // Scale to fit page cleanly
    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;
    const scale = Math.min((width - 40) / imgWidth, (height - 40) / imgHeight);

    const drawW = imgWidth * scale;
    const drawH = imgHeight * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return {
    blob,
    url: URL.createObjectURL(blob)
  };
}

/**
 * 6. Split PDF (Extract specific pages)
 */
export async function splitPDF(file: File, rangeString: string): Promise<{ blob: Blob; url: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();
  
  // Parse ranges like "1, 2,  4-6"
  const indicesToCopy: number[] = [];
  const cleanRange = rangeString.replace(/\s+/g, '');
  
  if (cleanRange.toLowerCase() === 'all' || !cleanRange) {
    for (let i = 0; i < pageCount; i++) {
      indicesToCopy.push(i);
    }
  } else {
    const segments = cleanRange.split(',');
    for (const segment of segments) {
      if (segment.includes('-')) {
        const [startStr, endStr] = segment.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(pageCount, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            indicesToCopy.push(i - 1); // 0-indexed
          }
        }
      } else {
        const pageNum = parseInt(segment, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount) {
          indicesToCopy.push(pageNum - 1);
        }
      }
    }
  }

  // Deduplicate
  const uniqueIndices = Array.from(new Set(indicesToCopy)).sort((a, b) => a - b);

  if (uniqueIndices.length === 0) {
    throw new Error('No valid pages found in selected range. Page count of PDF is: ' + pageCount);
  }

  const splitPdf = await PDFDocument.create();
  const copiedPages = await splitPdf.copyPages(pdf, uniqueIndices);
  copiedPages.forEach((page) => splitPdf.addPage(page));

  const pdfBytes = await splitPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return {
    blob,
    url: URL.createObjectURL(blob)
  };
}

/**
 * 7. Pack files to ZIP
 */
export async function createZIP(files: File[], archiveName: string): Promise<{ blob: Blob; url: string }> {
  const zip = new JSZip();
  
  files.forEach((file) => {
    zip.file(file.name, file);
  });

  const finalName = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
  const blob = await zip.generateAsync({ type: 'blob' });

  return {
    blob,
    url: URL.createObjectURL(blob)
  };
}

/**
 * 8. Extract files from ZIP
 */
export interface ZipFileEntry {
  name: string;
  size: number;
  isDirectory: boolean;
  getBlob: () => Promise<Blob>;
}

export async function extractZIP(file: File): Promise<ZipFileEntry[]> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const entries: ZipFileEntry[] = [];

  zip.forEach((relativePath, zipEntry) => {
    entries.push({
      name: relativePath,
      size: (zipEntry as any)._data?.uncompressedSize || 0,
      isDirectory: zipEntry.dir,
      getBlob: async () => {
        return await zipEntry.async('blob');
      }
    });
  });

  return entries;
}


/* --- HELPER PARSERS --- */

/**
 * Parse CSV format into JSON rows
 */
function parseCSV(text: string, separator: string = ','): any[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0], separator);
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = splitCSVLine(line, separator);
    const row: any = {};
    
    headers.forEach((header, index) => {
      const cleanHeader = header.trim().replace(/^["']|["']$/g, '');
      const rawVal = values[index] || '';
      const cleanVal = rawVal.trim().replace(/^["']|["']$/g, '');
      
      // Parse numbers if applicable
      if (cleanVal !== '' && !isNaN(Number(cleanVal))) {
        row[cleanHeader] = Number(cleanVal);
      } else if (cleanVal.toLowerCase() === 'true') {
        row[cleanHeader] = true;
      } else if (cleanVal.toLowerCase() === 'false') {
        row[cleanHeader] = false;
      } else {
        row[cleanHeader] = cleanVal;
      }
    });
    
    result.push(row);
  }

  return result;
}

function splitCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Converts JSON Array into CSV format
 */
function convertJSONToCSV(json: any, separator: string = ','): string {
  let arr: any[] = [];
  if (Array.isArray(json)) {
    arr = json;
  } else if (typeof json === 'object' && json !== null) {
    arr = [json];
  } else {
    throw new Error('JSON structure is not tabular');
  }

  if (arr.length === 0) return '';
  
  // Collect all unique keys
  const keysSet = new Set<string>();
  arr.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(k => keysSet.add(k));
    }
  });

  const keys = Array.from(keysSet);
  const headerLine = keys.map(k => `"${k.replace(/"/g, '""')}"`).join(separator);
  
  const csvLines = arr.map(item => {
    return keys.map(k => {
      const val = item[k];
      if (val === undefined || val === null) {
        return '""';
      }
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(separator);
  });

  return [headerLine, ...csvLines].join('\n');
}

/**
 * Minimal XML to JSON converter
 */
function parseXMLToJSON(xmlText: string): any {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const nodeToJson = (node: Node): any => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue?.trim();
      }
      
      const obj: any = {};
      const children = Array.from(node.childNodes);
      
      // If single text child
      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        return children[0].nodeValue?.trim();
      }
      
      children.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const name = child.nodeName;
          const value = nodeToJson(child);
          if (obj[name] !== undefined) {
            if (Array.isArray(obj[name])) {
              obj[name].push(value);
            } else {
              obj[name] = [obj[name], value];
            }
          } else {
            obj[name] = value;
          }
        }
      });
      
      return obj;
    };

    return nodeToJson(xmlDoc.documentElement);
  } catch (e) {
    return { error: 'XML Parsing failed', originalText: xmlText.substring(0, 500) };
  }
}

/**
 * Converts JSON to XML
 */
function convertJSONToXML(json: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  
  const helper = (obj: any, indent: string = '  '): string => {
    let result = '';
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        result += `${indent}<item>\n${helper(item, indent + '  ')}${indent}</item>\n`;
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (typeof val === 'object' && val !== null) {
          result += `${indent}<${safeKey}>\n${helper(val, indent + '  ')}${indent}</${safeKey}>\n`;
        } else {
          const safeVal = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          result += `${indent}<${safeKey}>${safeVal}</${safeKey}>\n`;
        }
      });
    } else {
      const safeVal = String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      result += `${indent}${safeVal}\n`;
    }
    return result;
  };

  xml += helper(json);
  xml += '</root>';
  return xml;
}

/**
 * Minimal HTML to MD converter
 */
function convertHTMLToMarkdown(html: string): string {
  let md = html;
  
  // Remove scripts & styles
  md = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  md = md.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Headers
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  
  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  
  // Bold & Italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  
  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  
  // Remove all other HTML Tags
  md = md.replace(/<[^>]*>/g, '');
  
  // Unescape entities
  md = md.replace(/&nbsp;/g, ' ')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&amp;/g, '&');
         
  return md.trim();
}

/**
 * Minimal MD to HTML converter
 */
function convertMarkdownToHTML(md: string): string {
  let html = md;
  
  // Escapes for XML entities
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

  // Bold / Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code Blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Lists
  html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');

  // Simple Paragraph wrapper (any line that isn't a heading/pre/li/code)
  const lines = html.split('\n');
  const wrapped = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<code') || trimmed.startsWith('<li') || trimmed.startsWith('</')) {
      return line;
    }
    return `<p>${line}</p>`;
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; }
    h1 { border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    h2 { margin-top: 24px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  ${wrapped.join('\n')}
</body>
</html>
  `.trim();
}
