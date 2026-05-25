import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  HelpCircle, 
  Settings, 
  Code, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Eye, 
  ExternalLink 
} from 'lucide-react';

export default function AdSenseGuide() {
  // Input form states for local storage preview testing
  const [pubId, setPubId] = useState('');
  const [slotTopVal, setSlotTopVal] = useState('');
  const [slotMidVal, setSlotMidVal] = useState('');
  const [slotBottomVal, setSlotBottomVal] = useState('');
  
  // Status states
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'required' | 'where' | 'sandbox'>('concepts');

  // Load existing local configuration
  useEffect(() => {
    setPubId(localStorage.getItem('adsense_client') || 'ca-pub-4195719659685299');
    setSlotTopVal(localStorage.getItem('adsense_slot_top') || '6291198910');
    setSlotMidVal(localStorage.getItem('adsense_slot_mid') || '6291198910');
    setSlotBottomVal(localStorage.getItem('adsense_slot_bottom') || '6291198910');
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pubId) {
      localStorage.setItem('adsense_client', pubId.trim());
    } else {
      localStorage.removeItem('adsense_client');
    }

    if (slotTopVal) {
      localStorage.setItem('adsense_slot_top', slotTopVal.trim());
    } else {
      localStorage.removeItem('adsense_slot_top');
    }

    if (slotMidVal) {
      localStorage.setItem('adsense_slot_mid', slotMidVal.trim());
    } else {
      localStorage.removeItem('adsense_slot_mid');
    }

    if (slotBottomVal) {
      localStorage.setItem('adsense_slot_bottom', slotBottomVal.trim());
    } else {
      localStorage.removeItem('adsense_slot_bottom');
    }

    setIsSaved(true);
    
    // Broadcast custom event so the ad units re-render dynamically
    window.dispatchEvent(new Event('adsense-config-updated'));

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleClearConfig = () => {
    localStorage.removeItem('adsense_client');
    localStorage.removeItem('adsense_slot_top');
    localStorage.removeItem('adsense_slot_mid');
    localStorage.removeItem('adsense_slot_bottom');
    
    setPubId('');
    setSlotTopVal('');
    setSlotMidVal('');
    setSlotBottomVal('');
    
    window.dispatchEvent(new Event('adsense-config-updated'));
    alert('Local configuration cleared. Reverted to Default Premium Placeholders!');
  };

  return (
    <section id="adsense-guide" className="w-full max-w-[640px] mx-auto bg-white border border-[#E5E5E0] rounded-[16px] p-6 shadow-sm transition-all hover:shadow-md">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E0] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#F9BC05]/10 rounded-lg flex items-center justify-center text-[#F9BC05] font-extrabold text-lg shadow-sm border border-[#F9BC05]/20 shrink-0">
            $
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
              AdSense Monetization & Integration Hub
            </h2>
            <p className="text-xs text-[#888888]">
              Set up your custom account to earn ad revenue from daily traffic
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[10px] uppercase font-bold text-[#4F46E5] bg-[#4F46E5]/10 px-2.5 py-0.5 rounded-full select-none shrink-0 tracking-wider font-mono">
          Interactive Guide
        </span>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[#E5E5E0] gap-3 mb-5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'concepts' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-[#888888] hover:text-[#1A1A1A]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          How to Earn
        </button>
        <button
          onClick={() => setActiveTab('required')}
          className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'required' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-[#888888] hover:text-[#1A1A1A]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Required Info
        </button>
        <button
          onClick={() => setActiveTab('where')}
          className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'where' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-[#888888] hover:text-[#1A1A1A]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Where to Get It
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'sandbox' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-[#888888] hover:text-[#1A1A1A]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Sandbox Setup Form
        </button>
      </div>

      {/* Tab 1: How to Earn */}
      {activeTab === 'concepts' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8FF] border border-[#5E6AD2]/10 p-4 rounded-xl">
            <h3 className="text-xs font-extrabold text-[#5E6AD2] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              The Monetization Engine
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Utilitarian web tools like <strong>FileFlux</strong> attract users who stay on the page while processes complete. By hosting relevant Google Ads on your platform, you activate two powerful revenue streams:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#E5E5E0] p-3.5 rounded-xl hover:bg-[#F9F9FA] transition-colors">
              <h4 className="text-xs font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
                <span className="text-[#059669]">✔</span>
                CPC (Cost Per Click)
              </h4>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                You earn a direct payout whenever a visitor clicks on one of your customized ads. Interactive file conversion sites see some of the highest click-through rates in the utility category!
              </p>
            </div>

            <div className="border border-[#E5E5E0] p-3.5 rounded-xl hover:bg-[#F9F9FA] transition-colors">
              <h4 className="text-xs font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
                <span className="text-[#059669]">✔</span>
                CPM (Cost Per Mille)
              </h4>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Earn money simply by displaying ads! Every 1,000 times an ad is viewed on your pages accumulatively (impressions), Google pays you a steady base rate.
              </p>
            </div>
          </div>

          <div className="bg-[#F0FDF4] text-[#15803D] p-3 rounded-lg text-xs flex items-start gap-2 border border-[#DCFCE7]">
            <span className="font-bold">Pro Tip:</span>
            <span>Placing multiple dynamic ad units inside the page margins (header, content, and footer) multiplies your global CPM values because multiple impressions count simultaneously per visitor!</span>
          </div>
        </div>
      )}

      {/* Tab 2: Required Info */}
      {activeTab === 'required' && (
        <div className="space-y-4">
          <p className="text-xs text-[#555555] leading-relaxed">
            Google AdSense units require exactly two dynamic parameters to securely track and award earned ad revenue directly to your personal wallet:
          </p>

          <div className="space-y-3">
            <div className="border border-[#E5E5E0] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1A1A1A]">1. Publisher Client ID</span>
                <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Global</span>
              </div>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                An identifier linking the entire website to your overall Google AdSense account.
              </p>
              <div className="mt-1.5 bg-[#F9F9FA] px-2 py-1 rounded border font-mono text-[10px] text-stone-600 flex justify-between">
                <span>Format: ca-pub-XXXXXXXXXXXXXXXX</span>
                <span className="text-stone-400">e.g. 16 digits</span>
              </div>
            </div>

            <div className="border border-[#E5E5E0] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1A1A1A]">2. Ad Unit Slot IDs</span>
                <span className="text-[10px] font-mono text-[#059669] font-bold bg-[#E6F4EA] px-1.5 py-0.5 rounded">Unit Specific</span>
              </div>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Unique identifiers assigned to each of your created spaces so Google knows exactly what size, theme, and ad style to mount.
              </p>
              <div className="mt-1.5 bg-[#F9F9FA] px-2 py-1 rounded border font-mono text-[10px] text-stone-600 flex justify-between">
                <span>Format: XXXXXXXXXX</span>
                <span className="text-stone-400">e.g. 10 digits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Where to Get It */}
      {activeTab === 'where' && (
        <div className="space-y-4">
          <p className="text-xs text-[#555555] leading-relaxed">
            Follow these direct steps to retrieve these values instantly inside your personal <strong>Google AdSense Dashboard</strong>:
          </p>

          <ol className="space-y-3 text-xs text-[#555555]">
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-[#E5E5E0] font-mono font-bold text-[#1A1A1A] flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="font-bold text-[#1A1A1A]">Access your Dashboard</p>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Sign in securely at <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-[#4F46E5] hover:underline inline-flex items-center gap-0.5 font-semibold">adsense.google.com <ExternalLink className="w-2.5 h-2.5" /></a>
                </p>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-[#E5E5E0] font-mono font-bold text-[#1A1A1A] flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="font-bold text-[#1A1A1A]">Go to the Ads Section</p>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Click on <strong>Ads</strong> inside your left navigation menu, then navigate to the top tab labeled <strong className="text-[#1A1A1A]">By ad unit</strong>.
                </p>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-[#E5E5E0] font-mono font-bold text-[#1A1A1A] flex items-center justify-center shrink-0">3</span>
              <div>
                <p className="font-bold text-[#1A1A1A]">Create or Select your Preferred Ad Units</p>
                <p className="text-[11px] text-[#888888] mt-1">
                  You requested details on the 4 recommended AdSense options in the dashboard:
                </p>
                
                <div className="mt-2 space-y-1.5 pl-1">
                  <div className="bg-[#F5F5F3] p-2 rounded border border-[#E5E5E0]">
                    <span className="font-bold text-stone-800">Display ads:</span> Recommended for the <strong className="text-[#4F46E5]">Top zone</strong>. Responsive shape works great anywhere.
                  </div>
                  <div className="bg-[#F5F5F3] p-2 rounded border border-[#E5E5E0]">
                    <span className="font-bold text-stone-800">In-feed ads:</span> Best nested between features or listed tools. Seamless look matches layout lists.
                  </div>
                  <div className="bg-[#F5F5F3] p-2 rounded border border-[#E5E5E0]">
                    <span className="font-bold text-stone-800">In-article ads:</span> Perfect for inserting directly between instructions or FAQ components.
                  </div>
                  <div className="bg-[#F5F5F3] p-2 rounded border border-[#E5E5E0]">
                    <span className="font-bold text-stone-800">Multiplex ads:</span> Best for the <strong className="text-[#4F46E5]">Bottom footer zone</strong>. Displays a rich recommendation grid of ads.
                  </div>
                </div>

                {/* React SPA vs AMP Warning box */}
                <div className="mt-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-[11px] leading-relaxed">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    <span>⚠️</span> Standard HTML AdSense vs AMP AdSense:
                  </p>
                  <p className="mt-1">
                    Your website is built using high-performance <strong>modern React (Vite + JSX)</strong>. Ensure you copy the <strong>Standard HTML code</strong> (with the <code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded">&lt;ins&gt;</code> tag) rather than the <code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded">&lt;amp-ad&gt;</code> code. 
                  </p>
                  <p className="mt-1">
                    The AMP ad version is strictly reserved for Google's legacy Accelerated Mobile Pages architecture and will not load inside responsive React components. Your Standard HTML snippet code is already fully configured!
                  </p>
                </div>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-[#E5E5E0] font-mono font-bold text-[#1A1A1A] flex items-center justify-center shrink-0">4</span>
              <div>
                <p className="font-bold text-[#1A1A1A]">Extract the Code Attributes</p>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Click the <strong>{"<> Get Code"}</strong> link button next to your listed unit. Google will present an HTML snippet. Simply extract the following parameters:
                </p>
                <div className="mt-2 bg-[#FAF8FF] border border-[#5E6AD2]/10 p-2.5 rounded font-mono text-[10px] text-stone-700 space-y-1">
                  <div>• <span className="font-bold text-[#5E6AD2]">Publisher ID</span> is in <code className="text-[#EA4335]">data-ad-client="ca-pub-################"</code></div>
                  <div>• <span className="font-bold text-[#5E6AD2]">Ad Slot ID</span> is in <code className="text-[#EA4335]">data-ad-slot="##########"</code></div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Tab 4: Sandbox Form */}
      {activeTab === 'sandbox' && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <p className="text-xs text-[#555555] leading-relaxed">
            Enter your credentials below to inject them instantly into your live preview page. This sandbox lets you verify alignment and layout safely!
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                AdSense Publisher ID (ca-pub-XXXXXXXXXXXX)
              </label>
              <input
                type="text"
                placeholder="e.g. ca-pub-1234567890123456"
                value={pubId}
                onChange={(e) => setPubId(e.target.value)}
                className="w-full bg-[#F9F9FA] border border-[#E5E5E0] rounded-lg p-2 text-xs font-mono focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] mb-1">
                  1. Top Unit (Leaderboard)
                </label>
                <input
                  type="text"
                  placeholder="Slot ID (e.g. 1000000001)"
                  value={slotTopVal}
                  onChange={(e) => setSlotTopVal(e.target.value)}
                  className="w-full bg-[#F9F9FA] border border-[#E5E5E0] rounded-lg p-2 text-xs font-mono focus:border-[#4F46E5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] mb-1">
                  2. Mid Units (In-Feed)
                </label>
                <input
                  type="text"
                  placeholder="Slot ID (e.g. 1000000002)"
                  value={slotMidVal}
                  onChange={(e) => setSlotMidVal(e.target.value)}
                  className="w-full bg-[#F9F9FA] border border-[#E5E5E0] rounded-lg p-2 text-xs font-mono focus:border-[#4F46E5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] mb-1">
                  3. Bottom Unit (Multiplex)
                </label>
                <input
                  type="text"
                  placeholder="Slot ID (e.g. 1000000003)"
                  value={slotBottomVal}
                  onChange={(e) => setSlotBottomVal(e.target.value)}
                  className="w-full bg-[#F9F9FA] border border-[#E5E5E0] rounded-lg p-2 text-xs font-mono focus:border-[#4F46E5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 flex-wrap">
            <button
              type="submit"
              className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Apply Credentials Locally
            </button>
            <button
              type="button"
              onClick={handleClearConfig}
              className="border border-[#E5E5E0] text-[#1A1A1A] hover:bg-[#F5F5F3] font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
            >
              Clear / Reset Sandbox
            </button>
          </div>

          {isSaved && (
            <div className="bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] rounded-lg p-3 text-xs flex items-center gap-2">
              <span className="font-bold flex items-center justify-center bg-[#059669] text-white w-4.5 h-4.5 rounded-full text-[10px]">✓</span>
              <span>Local Sandbox Loaded! All active page banners have been linked to your configured ID.</span>
            </div>
          )}

          <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] p-3 rounded-lg text-[10px] leading-relaxed">
            Note: Google AdSense requires an active website review step on your domain. Once configured here locally, adsense.js scripts generate query requests. When hosted online, you can input your matching domain name in your AdSense console.
          </div>
        </form>
      )}
    </section>
  );
}
