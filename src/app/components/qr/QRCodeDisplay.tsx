"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  url: string;
  size?: number;
  className?: string;
};

export default function QRCodeDisplay({ url, size = 112, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) {
      return;
    }

    void QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  }, [size, url]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        aria-label={`QR code for ${url}`}
        className="rounded-md bg-white p-1"
      />
    </div>
  );
}
