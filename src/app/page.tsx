"use client";

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { supabase } from '@/lib/supabaseClient';
import { ContainerRecord, ContainerInsert } from '@/lib/types';
import { Camera, Truck, Database, RotateCcw, Loader2 } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [containerNo, setContainerNo] = useState<string>("");
  const [truckNo, setTruckNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Ready");
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" as const,
  };

  const captureAndScan = async () => {
    try {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        alert("Camera not ready!");
        return;
      }

      setCapturedImage(imageSrc);
      setLoading(true);
      setStatus("AI Scanning...");

      const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');

      const cleanedText = text.replace(/[^A-Z0-9]/g, "").toUpperCase();
      setContainerNo(cleanedText || "NOT DETECTED");
      setStatus("Scan Complete");
    } catch (err) {
      console.error("OCR Error:", err);
      setStatus("Scan Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!containerNo || !truckNo) {
      alert("Please fill both fields!");
      return;
    }

    setStatus("Saving...");
    try {
      const record: ContainerInsert = {
        container_no: containerNo,
        truck_no: truckNo,
        status: 'Sound'
      };

      const { error } = await supabase
        .from('containers')
        .insert([record]);

      if (error) throw error;

      alert("Data Saved Successfully!");
      reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error: " + errorMessage);
      setStatus("Error");
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setContainerNo("");
    setTruckNo("");
    setStatus("Ready");
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-20 font-sans flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-900 p-4 rounded-2xl mb-6 border border-slate-800 flex items-center gap-3">
        <Truck className="text-blue-500" size={24} />
        <h1 className="font-bold tracking-tight uppercase text-sm">Yard AI Scanner</h1>
      </div>

      <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl relative aspect-video">
        {!capturedImage ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Next.js Image Component */
          <div className="relative w-full h-full">
            <Image 
              src={capturedImage} 
              alt="Captured container" 
              fill // Container ke mutabiq resize hone ke liye
              className="object-cover opacity-80"
              unoptimized // Base64 images ke liye ye zaroori hai
            />
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
            <p className="text-xs font-bold text-blue-400 uppercase">Scanning Container...</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-6 space-y-4">
        {!capturedImage ? (
          <button 
            onClick={captureAndScan} 
            className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
          >
            <Camera size={24} /> CAPTURE & SCAN
          </button>
        ) : (
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black mb-1 block ml-1">Truck ID</label>
                <input
                  type="text"
                  placeholder="Enter Truck No"
                  value={truckNo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTruckNo(e.target.value)}
                  className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black mb-1 block ml-1">Detected No.</label>
                <input
                  type="text"
                  value={containerNo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setContainerNo(e.target.value)}
                  className="w-full bg-slate-800 p-4 rounded-xl text-blue-400 font-mono text-xl border border-slate-700 outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 bg-slate-800 p-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                <RotateCcw size={18} /> RETAKE
              </button>
              <button onClick={handleSave} className="flex-[2] bg-green-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <Database size={18} /> SAVE RECORD
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 bg-slate-900/50 py-2 px-4 rounded-full w-fit mx-auto border border-slate-800 mt-4">
          <div className={`w-1.5 h-1.5 rounded-full ${status === "Ready" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}></div>
          <p className="text-[9px] text-slate-400 tracking-widest uppercase font-bold">{status}</p>
        </div>
      </div>
    </main>
  );
}