import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Check, 
  AlertCircle 
} from 'lucide-react';

// Subcomponents
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import SupportedFormats from './components/SupportedFormats';
import FeaturesSection from './components/FeaturesSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';

// Engine Processors
import {
  convertImage,
  compressImage,
  convertTextDocument,
  mergePDFs,
  convertImagesToPDF,
  splitPDF,
  createZIP
} from './utils/fileProcessors';

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

type TabType = 'convert' | 'compress' | 'resize' | 'merge' | 'split';

interface ResultType {
  name: string;
  url: string;
  size: number;
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // App states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('convert');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings states
  const [convertTargetFormat, setConvertTargetFormat] = useState<string>('png');
  const [compressQualityLevel, setCompressQualityLevel] = useState<string>('medium'); // low, medium, high
  const [resizeWidth, setResizeWidth] = useState<string>('800');
  const [resizeHeight, setResizeHeight] = useState<string>('600');
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [splitPagesString, setSplitPagesString] = useState<string>('1-2');

  // Trigger main file selector
  const triggerFileBrowser = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  // Safe tab determination based on file types
  const getSupportedTabs = (files: File[]): TabType[] => {
    if (files.length === 0) return [];
    
    // Check if all files are images
    const allImages = files.every(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return f.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext);
    });

    // Check if single PDF
    const firstExt = files[0].name.split('.').pop()?.toLowerCase() || '';
    if (firstExt === 'pdf' && files.length === 1) {
      return ['split', 'merge'];
    }

    if (allImages) {
      return ['convert', 'compress', 'resize', 'merge'];
    }

    if (['csv', 'json', 'xml', 'md', 'html', 'txt'].includes(firstExt)) {
      return ['convert'];
    }

    // Default safe tabs for general files
    return ['convert', 'compress'];
  };

  const handleFilesChosen = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    setSelectedFiles(filesArray);
    setResult(null);
    setErrorMessage(null);

    // Auto-configure optimal options and set active tab
    const firstFile = filesArray[0];
    const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';
    
    const tabs = getSupportedTabs(filesArray);
    if (tabs.length > 0) {
      setActiveTab(tabs[0]);
    }

    // Setup initial convert format dropdown options defaults
    if (firstFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      setConvertTargetFormat(ext === 'png' ? 'jpeg' : 'png');
    } else if (ext === 'csv') {
      setConvertTargetFormat('json');
    } else if (ext === 'json') {
      setConvertTargetFormat('csv');
    } else if (ext === 'xml') {
      setConvertTargetFormat('json');
    } else if (ext === 'md') {
      setConvertTargetFormat('html');
    } else if (ext === 'html') {
      setConvertTargetFormat('md');
    } else if (ext === 'txt') {
      setConvertTargetFormat('pdf');
    } else {
      setConvertTargetFormat('pdf');
    }
  };

  // Get active tabs for the uploaded files
  const supportedTabs = getSupportedTabs(selectedFiles);

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  // Core conversion triggers
  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'convert') {
        const firstFile = selectedFiles[0];
        const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';
        
        if (firstFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
          const targetFormatResolved = (convertTargetFormat === 'jpg' ? 'jpeg' : convertTargetFormat) as any;
          const out = await convertImage(firstFile, {
            format: targetFormatResolved,
            quality: 0.9,
            rotate: 0,
            flipHorizontal: false,
            flipVertical: false,
            grayscale: false,
            invert: false,
            maintainAspectRatio: true
          });
          const baseName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) || firstFile.name;
          setResult({
            name: `${baseName}_converted.${out.ext}`,
            url: out.url,
            size: out.blob.size
          });
        } 
        else if (['csv', 'json', 'xml', 'md', 'html', 'txt'].includes(ext)) {
          const out = await convertTextDocument(firstFile, {
            format: convertTargetFormat as any
          });
          const baseName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) || firstFile.name;
          setResult({
            name: `${baseName}_converted.${out.ext}`,
            url: out.url,
            size: out.blob.size
          });
        } 
        else {
          // General browser download link
          setResult({
            name: firstFile.name,
            url: URL.createObjectURL(firstFile),
            size: firstFile.size
          });
        }
      } 
      
      else if (activeTab === 'compress') {
        const firstFile = selectedFiles[0];
        let quality = 70;
        let scale = 90;

        if (compressQualityLevel === 'high') {
          quality = 85;
          scale = 95;
        } else if (compressQualityLevel === 'low') {
          quality = 40;
          scale = 60;
        }

        const out = await compressImage(firstFile, quality, scale);
        const baseName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) || firstFile.name;
        const targetExt = firstFile.type === 'image/png' ? 'jpg' : (firstFile.name.split('.').pop() || 'jpg');
        setResult({
          name: `${baseName}_compressed.${targetExt}`,
          url: out.url,
          size: out.blob.size
        });
      } 
      
      else if (activeTab === 'resize') {
        const firstFile = selectedFiles[0];
        const w = parseInt(resizeWidth) || 800;
        const h = parseInt(resizeHeight) || 600;

        const inputExt = firstFile.name.split('.').pop()?.toLowerCase();
        let targetResizeFormat: 'png' | 'jpeg' | 'webp' = 'png';
        if (inputExt === 'jpg' || inputExt === 'jpeg') {
          targetResizeFormat = 'jpeg';
        } else if (inputExt === 'webp') {
          targetResizeFormat = 'webp';
        }

        const out = await convertImage(firstFile, {
          format: targetResizeFormat,
          quality: 0.9,
          rotate: 0,
          flipHorizontal: false,
          flipVertical: false,
          grayscale: false,
          invert: false,
          resizeWidth: w,
          resizeHeight: h,
          maintainAspectRatio: maintainAspect
        });

        const baseName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) || firstFile.name;
        setResult({
          name: `${baseName}_resized.${out.ext}`,
          url: out.url,
          size: out.blob.size
        });
      } 
      
      else if (activeTab === 'merge') {
        const isAllPDFs = selectedFiles.every(f => f.name.endsWith('.pdf'));
        const isAllImages = selectedFiles.every(f => f.type.startsWith('image/'));

        if (isAllPDFs) {
          const out = await mergePDFs(selectedFiles);
          setResult({
            name: 'fileflux_merged.pdf',
            url: out.url,
            size: out.blob.size
          });
        } else if (isAllImages) {
          const out = await convertImagesToPDF(selectedFiles);
          setResult({
            name: 'fileflux_compiled_images.pdf',
            url: out.url,
            size: out.blob.size
          });
        } else {
          // Fallback multiple files into one ZIP package recursively
          const out = await createZIP(selectedFiles, 'fileflux_archive.zip');
          setResult({
            name: 'fileflux_archive.zip',
            url: out.url,
            size: out.blob.size
          });
        }
      } 
      
      else if (activeTab === 'split') {
        const firstFile = selectedFiles[0];
        const out = await splitPDF(firstFile, splitPagesString);
        setResult({
          name: `split_pages_${splitPagesString.replace(/,/g, '_')}.pdf`,
          url: out.url,
          size: out.blob.size
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong during local conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const trigger = document.createElement('a');
    trigger.href = result.url;
    trigger.download = result.name;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResult(null);
    setErrorMessage(null);
  };

  // Drag and drop event handlers
  const [isHovered, setIsHovered] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={(e) => handleFilesChosen(e.target.files)}
        multiple
        className="hidden" 
      />

      {/* 1. NAVBAR */}
      <Navbar onStartClick={triggerFileBrowser} />

      {/* Page Body Container with 100px Section Gaps */}
      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-12 flex flex-col gap-[100px]">
        
        {/* 2. HERO & ACTIVE WORKSPACE (UPLOAD ZONE / ACTIVE TASK) */}
        <div className="flex flex-col gap-10">
          {selectedFiles.length === 0 && (
            <Hero onStartClick={triggerFileBrowser} />
          )}

          <section id="workspace-zone" className="w-full">
            {selectedFiles.length === 0 ? (
              /* [3. UPLOAD ZONE] */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileBrowser}
                className={`w-full max-w-[640px] h-[200px] mx-auto rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center bg-white cursor-pointer transition-all ${
                  isHovered ? 'border-[#4F46E5]' : 'border-[#E5E5E0]'
                }`}
              >
                {/* Simple Gray upload icon */}
                <Upload className="w-7 h-7 text-[#888888] mb-3" />
                
                <p className="text-base font-bold text-[#1A1A1A] mb-1">
                  Drop your file here
                </p>
                
                <p className="text-sm text-[#4F46E5] underline font-medium mb-3">
                  or click to browse
                </p>
                
                <p className="text-xs text-[#888888] font-normal px-4 text-center">
                  Works with images, PDFs, audio, video, documents, and more
                </p>
              </div>
            ) : result ? (
              /* [5. RESULT] */
              <div className="w-full bg-[#F5F5F3] border border-[#E5E5E0] rounded-[16px] p-8 text-center max-w-[640px] mx-auto">
                {/* Green checkmark */}
                <div className="w-12 h-12 bg-[#059669] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">
                  Done! Your file is ready.
                </h3>

                <p className="text-sm text-[#888888] mb-6 font-medium">
                  {result.name} ({formatBytes(result.size)})
                </p>

                {/* Big indigo download button */}
                <button
                  onClick={handleDownload}
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-lg transition-colors mb-4 cursor-pointer"
                >
                  Download file
                </button>

                {/* Reset link */}
                <button
                  onClick={handleReset}
                  className="text-xs text-[#888888] hover:text-[#1A1A1A] underline transition-colors cursor-pointer"
                >
                  Convert another file
                </button>
              </div>
            ) : (
              /* [4. AFTER FILE IS UPLOADED] */
              <div className="w-full bg-white border border-[#E5E5E0] rounded-[16px] p-8 max-w-[640px] mx-auto space-y-6">
                
                {/* Row: Icon | Name | Size | Change File */}
                <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="w-5 h-5 text-[#888888] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate max-w-[280px]">
                        {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`}
                      </p>
                      <p className="text-xs text-[#888888]">
                        {formatBytes(totalSize)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={triggerFileBrowser}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    [Change file]
                  </button>
                </div>

                {/* Tabs Row */}
                <div className="flex border-b border-[#E5E5E0] gap-4">
                  {supportedTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-xs font-semibold uppercase tracking-wider relative transition-colors ${
                        activeTab === tab ? 'text-[#4F46E5]' : 'text-[#888888] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4F46E5]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Dynamic Error Indicator */}
                {errorMessage && (
                  <div className="bg-[#FEF2F2] text-[#DC2626] rounded-lg p-3 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Settings Panel */}
                <div className="py-2 space-y-4">
                  
                  {/* 1. Convert settings */}
                  {activeTab === 'convert' && (
                    <div className="grid grid-cols-1 gap-4 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#1A1A1A]">
                          Convert to:
                        </label>
                        <select
                          value={convertTargetFormat}
                          onChange={(e) => setConvertTargetFormat(e.target.value)}
                          className="bg-white border border-[#E5E5E0] rounded-lg p-2.5 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                        >
                          {selectedFiles[0]?.type.startsWith('image/') ? (
                            <>
                              <option value="png">PNG</option>
                              <option value="jpeg">JPG</option>
                              <option value="webp">WEBP</option>
                            </>
                          ) : ['csv', 'json', 'xml', 'md', 'html', 'txt'].includes(selectedFiles[0]?.name.split('.').pop()?.toLowerCase() || '') ? (
                            <>
                              {selectedFiles[0]?.name.endsWith('.csv') && (
                                <>
                                  <option value="json">JSON</option>
                                  <option value="xml">XML</option>
                                </>
                              )}
                              {selectedFiles[0]?.name.endsWith('.json') && (
                                <>
                                  <option value="csv">CSV</option>
                                  <option value="xml">XML</option>
                                </>
                              )}
                              {selectedFiles[0]?.name.endsWith('.xml') && <option value="json">JSON</option>}
                              {selectedFiles[0]?.name.endsWith('.md') && (
                                <>
                                  <option value="html">HTML</option>
                                  <option value="json">JSON</option>
                                </>
                              )}
                              {selectedFiles[0]?.name.endsWith('.html') && <option value="md">Markdown (MD)</option>}
                              {selectedFiles[0]?.name.endsWith('.txt') && (
                                <>
                                  <option value="pdf">PDF Document</option>
                                  <option value="json">JSON Package</option>
                                </>
                              )}
                            </>
                          ) : (
                            <option value="pdf">PDF Document</option>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 2. Compress settings */}
                  {activeTab === 'compress' && (
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-[#1A1A1A]">
                        Compression level:
                      </label>
                      <select
                        value={compressQualityLevel}
                        onChange={(e) => setCompressQualityLevel(e.target.value)}
                        className="bg-white border border-[#E5E5E0] rounded-lg p-2.5 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                      >
                        <option value="high">High quality (Larger file size)</option>
                        <option value="medium">Medium quality (Default balanced)</option>
                        <option value="low">Low quality (Smallest file size)</option>
                      </select>
                    </div>
                  )}

                  {/* 3. Resize settings */}
                  {activeTab === 'resize' && (
                    <div className="space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1A1A1A]">
                            Width (pixels):
                          </label>
                          <input
                            type="number"
                            value={resizeWidth}
                            onChange={(e) => setResizeWidth(e.target.value)}
                            className="bg-white border border-[#E5E5E0] rounded-lg p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1A1A1A]">
                            Height (pixels):
                          </label>
                          <input
                            type="number"
                            value={resizeHeight}
                            onChange={(e) => setResizeHeight(e.target.value)}
                            className="bg-white border border-[#E5E5E0] rounded-lg p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-[#888888] font-normal cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maintainAspect}
                          onChange={(e) => setMaintainAspect(e.target.checked)}
                          className="rounded border-[#E5E5E0] text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5"
                        />
                        <span>Keep original aspect ratio</span>
                      </label>
                    </div>
                  )}

                  {/* 4. Merge settings */}
                  {activeTab === 'merge' && (
                    <div className="text-left text-xs text-[#888888] leading-relaxed">
                      <p className="font-bold text-[#1A1A1A] mb-1">Merge Strategy:</p>
                      {selectedFiles.every(f => f.name.endsWith('.pdf')) ? (
                        <span>All selection documents are PDFs. They will be joined together into a single combined PDF.</span>
                      ) : selectedFiles.every(f => f.type.startsWith('image/')) ? (
                        <span>All files are images. They will be formatted as multi-page PDF presentation.</span>
                      ) : (
                        <span>Multiple formats detected. They will be archived together in a single ZIP folder.</span>
                      )}
                    </div>
                  )}

                  {/* 5. Split settings */}
                  {activeTab === 'split' && (
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-[#1A1A1A]">
                        Pages to extract:
                      </label>
                      <input
                        type="text"
                        value={splitPagesString}
                        placeholder="e.g. 1-2, 5"
                        onChange={(e) => setSplitPagesString(e.target.value)}
                        className="bg-white border border-[#E5E5E0] rounded-lg p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]"
                      />
                      <span className="text-[10px] text-[#888888]">
                        Enter page numbers separated by commas, or range with dashes. For example: 1-2, 5.
                      </span>
                    </div>
                  )}

                </div>

                {/* Action Button */}
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold text-sm py-3 rounded-lg transition-colors cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} now →`}
                </button>

              </div>
            )}
          </section>
        </div>

        {/* 3. SUPPORTED FORMATS */}
        <SupportedFormats />

        {/* 4. HOW IT WORKS */}
        <HowItWorks />

        {/* 5. FEATURES SECTION */}
        <FeaturesSection />

        {/* 6. FAQ */}
        <FaqSection />

      </main>

      {/* 9. FOOTER */}
      <Footer />
    </div>
  );
}
