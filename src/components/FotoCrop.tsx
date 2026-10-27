"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, X } from "lucide-react";

interface Props {
  src: string;
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

function centerAspectCrop(w: number, h: number) {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 16 / 9, w, h), w, h);
}

async function cropToFile(img: HTMLImageElement, crop: PixelCrop, originalName: string): Promise<{ file: File; url: string }> {
  const canvas = document.createElement("canvas");
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob!], originalName, { type: "image/jpeg" });
      resolve({ file, url: URL.createObjectURL(blob!) });
    }, "image/jpeg", 0.92);
  });
}

export default function FotoCrop({ src, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalName] = useState("cartao.jpg");

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  async function handleConfirm() {
    if (!imgRef.current || !completedCrop) return;
    const { file, url } = await cropToFile(imgRef.current, completedCrop, originalName);
    onConfirm(file, url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60">
        <button onClick={onCancel} className="text-white/70 hover:text-white p-2">
          <X size={22} />
        </button>
        <span className="text-white text-sm font-medium">Ajuste o recorte</span>
        <button
          onClick={handleConfirm}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Check size={16} />
          Usar foto
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={16 / 9}
          minWidth={50}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="Recortar foto"
            onLoad={onImageLoad}
            style={{ maxHeight: "70vh", maxWidth: "100%" }}
          />
        </ReactCrop>
      </div>

      <p className="text-center text-white/50 text-xs pb-4">Arraste para ajustar o recorte</p>
    </div>
  );
}
