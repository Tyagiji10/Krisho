import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCcw } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-6 border-b border-border dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Adjust Image</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        <div className="relative flex-grow bg-slate-200 dark:bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-grow py-4 rounded-2xl font-bold border border-border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex-grow py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to create the cropped image
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL('image/jpeg'));
    };
    image.onerror = (error) => reject(error);
  });
};

export default ImageCropper;
