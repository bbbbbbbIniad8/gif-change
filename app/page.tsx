"use client";

import { useState } from "react";
import { encode } from "modern-gif";


export default function GifCreator() {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function loadImage(src : string) : Promise<HTMLImageElement>{
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  const generateGif = async (imagePath : string) => {
    setLoading(true);

    try {
      const image = await loadImage(imagePath);
      URL.revokeObjectURL(imagePath);

      const canvas = document.createElement("canvas");
      const { width, height } = image;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const frames = [];
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      for(let i:number=0; i < 2; i++){
        frames.push({ 
        data: imageData.data, 
        delay: 1000 
      });
      }
    
      const output = await encode({
        width: width,
        height: height,
        frames: frames,
      });

      const blob = new Blob([output], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
    } catch (error) {
      console.log("GIF生成エラー:", error);
    } finally {
      setLoading(false);
    }
  };

 const run = (event: React.ChangeEvent<HTMLInputElement>) =>{
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const url = URL.createObjectURL(file);
        generateGif(url);
      }
  }
 

  return (
    <div className="p-10 text-center">
      <label className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold cursor-pointer 
        ${loading ? 'bg-gray-400' : 'hover:bg-indigo-700'}`}>
      画像を選択
      <input
        type="file"
        onChange={run}
        disabled={loading}
        className="hidden"
      >
      </input>
      </label>

      <p className="p-5 font-bold">{loading ? "生成中..." : "AI対策のために画像をGIFにする"}</p>

      {resultUrl && (
        <div className="mt-3">
          <p className="mb-2">完成したGIF:</p>
          <a href={resultUrl} download="test.gif" className="px-6 py-3 font-bold bg-indigo-600 text-white rounded-lg  cursor-pointer ">
            ダウンロードする
          </a>
          <img src={resultUrl} alt="Generated GIF" className="mt-5 mx-auto border shadow-xl w-3/10"/>
          <br />
          
        </div>
      )}
    </div>
  );
}