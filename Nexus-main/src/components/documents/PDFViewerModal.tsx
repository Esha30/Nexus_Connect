import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
 isOpen: boolean;
 onClose: () => void;
 fileUrl: string;
 title: string;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, fileUrl, title }) => {
 const [numPages, setNumPages] = useState<number | null>(null);
 const [pageNumber, setPageNumber] = useState(1);
 const [scale, setScale] = useState(1.0);

 if (!isOpen) return null;

 function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
 setNumPages(numPages);
 setPageNumber(1);
 }

 const downloadFile = () => {
 window.open(fileUrl, '_blank');
 };

 return (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
 <Card className="w-full max-w-5xl h-[90vh] flex flex-col shadow-sm bg-gray-100">
 <CardHeader className="flex flex-row justify-between items-center border-b p-4 bg-white">
 <div className="flex items-center gap-3">
 <h2 className="text-xl font-semibold text-gray-900 truncate max-w-md">{title}</h2>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut size={18}/></Button>
 <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
 <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(2, s + 0.2))}><ZoomIn size={18}/></Button>
 <div className="w-px h-6 bg-gray-200 mx-1"></div>
 <Button variant="ghost" size="sm" onClick={downloadFile} leftIcon={<Download size={18} />}>Download</Button>
 <button onClick={onClose} className="ml-2 p-2 hover:bg-gray-100 rounded-full transition">
 <X size={24} className="text-gray-500" />
 </button>
 </div>
 </CardHeader>
 
 <CardBody className="flex-1 overflow-auto p-4 flex justify-center bg-gray-200/50">
 <div className="shadow-sm bg-white">
 <Document
 file={fileUrl}
 onLoadSuccess={onDocumentLoadSuccess}
 loading={<div className="p-8 text-center">Loading PDF...</div>}
 error={<div className="p-8 text-red-500 text-center">Failed to load PDF. Please try downloading instead.</div>}
 >
 <Page 
 pageNumber={pageNumber} 
 scale={scale} 
 renderTextLayer={false}
 renderAnnotationLayer={false}
 />
 </Document>
 </div>
 </CardBody>
 
 {numPages && (
 <div className="border-t p-4 flex justify-center items-center gap-6 bg-white shrink-0">
 <Button 
 variant="outline" 
 size="sm" 
 disabled={pageNumber <= 1} 
 onClick={() => setPageNumber(prev => prev - 1)}
 leftIcon={<ChevronLeft size={18} />}
 >
 Previous
 </Button>
 <span className="text-sm font-medium">
 Page {pageNumber} of {numPages}
 </span>
 <Button 
 variant="outline" 
 size="sm" 
 disabled={pageNumber >= (numPages || 0)} 
 onClick={() => setPageNumber(prev => prev + 1)}
 rightIcon={<ChevronRight size={18} />}
 >
 Next
 </Button>
 </div>
 )}
 </Card>
 </div>
 );
};
