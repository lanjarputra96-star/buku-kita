import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { useSibudi } from "@/lib/sibudi-store";
import { supabase } from "@/integrations/supabase/client";

const LogoContext = createContext("");

export function BrandProvider({ children }: { children: ReactNode }) {
  const { state } = useSibudi();
  const path = state.pengaturan.logoPath;
  const [url, setUrl] = useState("");

  useEffect(() => {
    let alive = true;
    setUrl("");
    if (!path) return;
    const load = async () => {
      const { data } = await supabase.storage.from("ebooks").createSignedUrl(path, 7200);
      if (alive) setUrl(data?.signedUrl ?? "");
    };
    void load();
    const timer = setInterval(() => void load(), 60 * 60 * 1000);
    return () => { alive = false; clearInterval(timer); };
  }, [path]);

  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) return;
    if (!url) {
      icon.href = "/favicon.ico";
      icon.type = "image/x-icon";
      return;
    }
    let alive = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!alive) return;
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = Math.min(64 / image.naturalWidth, 64 / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, (64 - w) / 2, (64 - h) / 2, w, h);
      try {
        icon.href = canvas.toDataURL("image/png");
        icon.type = "image/png";
      } catch { icon.href = url; icon.type = ""; }
    };
    image.src = url;
    return () => { alive = false; };
  }, [url]);

  return <LogoContext.Provider value={url}>{children}</LogoContext.Provider>;
}

export function BrandLogo({ fallback, className = "size-5" }: { fallback?: ReactNode; className?: string }) {
  const url = useContext(LogoContext);
  return url ? <img src={url} alt="Logo SIBUDI" className="size-full object-contain" /> : <>{fallback ?? <BookOpen className={className} />}</>;
}