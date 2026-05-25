import React, { useEffect, useState } from 'react';

interface AdSenseUnitProps {
  slotType: 'top' | 'mid' | 'bottom';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdSenseUnit({ slotType }: AdSenseUnitProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [client, setClient] = useState('');
  const [slotId, setSlotId] = useState('');

  // Sizing styles based on layout placement
  const placementStyles = {
    top: {
      container: "w-full max-w-[720px] mx-auto min-h-[90px] border border-[#E5E5E0] bg-[#F9F9FA] rounded-md flex items-center justify-center p-2 text-center",
      dimensions: "w-full h-[90px]",
      meta: "Top Banner (728x90 Billboard/Leaderboard Header)"
    },
    mid: {
      container: "w-full max-w-[640px] mx-auto min-h-[250px] border border-[#E5E5E0] bg-[#F9F9FA] rounded-lg flex items-center justify-center p-4 text-center",
      dimensions: "w-full h-[250px]",
      meta: "In-Feed/In-Article Contextual (300x250 Rectangle)"
    },
    bottom: {
      container: "w-full max-w-[720px] mx-auto min-h-[100px] border border-[#E5E5E0] bg-[#F9F9FA] rounded-md flex items-center justify-center p-2 text-center",
      dimensions: "w-full h-[100px]",
      meta: "Footer Multiplex Anchor (728x90 Responsive Banner)"
    }
  };

  const loadConfig = () => {
    const savedClient = localStorage.getItem('adsense_client');
    const savedTop = localStorage.getItem('adsense_slot_top');
    const savedMid = localStorage.getItem('adsense_slot_mid');
    const savedBottom = localStorage.getItem('adsense_slot_bottom');

    const metaEnv = (import.meta as any).env || {};
    
    const activeClient = savedClient || metaEnv.VITE_ADSENSE_CLIENT || 'ca-pub-4195719659685299';
    const activeTop = savedTop || metaEnv.VITE_ADSENSE_SLOT_TOP || '6291198910';
    const activeMid = savedMid || metaEnv.VITE_ADSENSE_SLOT_MID || '6291198910';
    const activeBottom = savedBottom || metaEnv.VITE_ADSENSE_SLOT_BOTTOM || '6291198910';

    setClient(activeClient);
    setSlotId(
      slotType === 'top' ? activeTop : 
      slotType === 'mid' ? activeMid : 
      activeBottom
    );
  };

  useEffect(() => {
    loadConfig();

    const handleUpdate = () => {
      loadConfig();
    };

    window.addEventListener('adsense-config-updated', handleUpdate);
    return () => {
      window.removeEventListener('adsense-config-updated', handleUpdate);
    };
  }, [slotType]);

  useEffect(() => {
    if (!client) return;

    // Load AdSense Script if not already loaded
    const scriptId = 'adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Try to trigger AdSense initialization
    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
      setAdLoaded(true);
    } catch (e) {
      console.warn('AdSense load block or adblock detector activated:', e);
    }
  }, [client, slotId]);

  const activePlacement = placementStyles[slotType];

  return (
    <div className="flex flex-col gap-1 w-full relative group">
      {/* Tiny descriptive badge */}
      <div className="flex items-center justify-between px-2 text-[9px] uppercase tracking-wider text-[#888888] font-mono">
        <span>Advertisement</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[#4F46E5]">
          Google AdSense Unit
        </span>
      </div>

      {client ? (
        /* Real AdSense HTML Code Placement */
        <div className={activePlacement.container}>
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={client}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Beautiful Visual Mock Advertisements for premium SaaS brands */
        <div className="w-full">
          {slotType === 'top' && (
            <a 
              href="https://vercel.com" 
              target="_blank" 
              rel="noreferrer"
              className="block w-full max-w-[720px] mx-auto min-h-[85px] border border-[#E5E5E0] bg-black text-white rounded-lg p-4 transition-transform hover:scale-[1.01] flex items-center justify-between gap-4 select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-extrabold shrink-0 text-lg">
                  ▲
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00E1EF] bg-[#00E1EF]/10 px-1.5 py-0.5 rounded-sm scale-90">Sponsored</span>
                    <h4 className="text-sm font-semibold tracking-tight text-white">Vercel: Fast frontend deployments</h4>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 hidden sm:block">
                    Deploy your single-page applications and servers globally with zero setup.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-black bg-white px-3 py-1.5 rounded hover:bg-stone-200 transition-colors shrink-0">
                Deploy Free →
              </span>
            </a>
          )}

          {slotType === 'mid' && (
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noreferrer"
              className="block w-full max-w-[640px] mx-auto min-h-[140px] border border-[#10B981]/30 bg-[#0c100e] text-[#EDEDED] rounded-xl p-5 transition-all hover:border-[#10B981]/50 hover:scale-[1.01] select-none shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-black shrink-0 text-xl border border-[#10B981]/20">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#10B981] tracking-widest bg-[#10B981]/10 px-1.5 py-0.5 rounded-sm">ADVERTISEMENT</span>
                      <h4 className="text-sm font-bold text-white tracking-tight">Supabase: The Open Source Firebase</h4>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 max-w-[420px] leading-relaxed">
                      Instant Postgres database, Authentication, Realtime subscriptions, and Storage. Build secure, robust server-driven web backends in minutes.
                    </p>
                  </div>
                </div>
                <button className="self-start sm:self-center bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shrink-0">
                  Create DB FREE
                </button>
              </div>
            </a>
          )}

          {slotType === 'bottom' && (
            <a 
              href="https://linear.app" 
              target="_blank" 
              rel="noreferrer"
              className="block w-full max-w-[720px] mx-auto min-h-[85px] border border-[#E5E5E0] bg-[#FAF8FF] text-[#1A1A1A] rounded-lg p-4 transition-transform hover:scale-[1.01] flex items-center justify-between gap-4 select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#5E6AD2] flex items-center justify-center text-white shrink-0">
                  <span className="font-extrabold text-sm font-mono">L</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5E6AD2] bg-[#5E6AD2]/10 px-1.5 py-0.5 rounded">Featured Ad</span>
                    <h4 className="text-sm font-bold text-[#1F1F1F]">Linear: Software tool for elite teams</h4>
                  </div>
                  <p className="text-xs text-[#888888] mt-0.5 hidden sm:block">
                    Streamline development cycles, roadmaps, bug-tracking, and backlog sprints effortlessly.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-white bg-[#5E6AD2] px-3.5 py-1.5 rounded hover:opacity-90 transition-opacity shrink-0">
                Get linear
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
