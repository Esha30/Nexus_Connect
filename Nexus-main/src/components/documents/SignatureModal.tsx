import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Check, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

interface SignatureModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (signatureData: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
 const sigCanvas = useRef<SignatureCanvas | null>(null);

 if (!isOpen) return null;

 const clear = () => {
 sigCanvas.current?.clear();
 };

 const save = () => {
 if (sigCanvas.current?.isEmpty()) {
 return;
 }
 const data = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
 if (data) {
 onSave(data);
 }
 };

 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
 <Card className="w-full max-w-xl shadow-sm">
 <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
 <h2 className="text-xl font-semibold text-gray-900">Sign Document</h2>
 <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
 <X size={24} />
 </button>
 </CardHeader>
 <CardBody className="pt-6">
 <p className="text-sm text-gray-500 mb-4">
 Please draw your signature in the box below. Use your mouse or touch screen.
 </p>
 
 <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
 <SignatureCanvas 
 ref={sigCanvas}
 penColor="black"
 canvasProps={{
 width: 500,
 height: 200,
 className: 'signature-canvas w-full cursor-crosshair'
 }}
 />
 </div>
 
 <div className="flex justify-between mt-6">
 <Button 
 variant="outline" 
 onClick={clear}
 leftIcon={<RotateCcw size={16} />}
 >
 Clear
 </Button>
 
 <div className="flex gap-3">
 <Button variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button 
 onClick={save}
 leftIcon={<Check size={16} />}
 >
 Sign & Complete
 </Button>
 </div>
 </div>
 </CardBody>
 </Card>
 </div>
 );
};
