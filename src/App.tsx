import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Settings, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateBanner, 
  checkApiKey, 
  openApiKeyDialog, 
  BannerParams, 
  ImageSize, 
  AspectRatio 
} from './services/geminiService';

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "1:1 (Square)", value: "1:1" },
  { label: "2:3 (Portrait)", value: "2:3" },
  { label: "3:2 (Landscape)", value: "3:2" },
  { label: "3:4 (Portrait)", value: "3:4" },
  { label: "4:3 (Landscape)", value: "4:3" },
  { label: "9:16 (Story)", value: "9:16" },
  { label: "16:9 (Widescreen)", value: "16:9" },
  { label: "21:9 (Ultrawide)", value: "21:9" },
];

const IMAGE_SIZES: ImageSize[] = ["1K", "2K", "4K"];

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [formData, setFormData] = useState<BannerParams>({
    productName: "",
    productDescription: "",
    cta: "Buy Now",
    targetUrl: "",
    imageSize: "1K",
    aspectRatio: "16:9",
  });

  useEffect(() => {
    const verifyApiKey = async () => {
      const connected = await checkApiKey();
      setHasApiKey(connected);
    };
    verifyApiKey();
  }, []);

  const handleConnectKey = async () => {
    await openApiKeyDialog();
    // Assume success as per instructions
    setHasApiKey(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      setError("Please connect your API key first.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    const messages = [
      "Analyzing product details...",
      "Refining visual prompt...",
      "Generating high-quality image...",
      "Applying professional lighting...",
      "Finalizing banner ad...",
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 3000);

    try {
      const imageUrl = await generateBanner(formData);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("API Key error. Please re-select your key.");
      } else {
        setError(err.message || "Failed to generate banner. Please try again.");
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `banner-${formData.productName.toLowerCase().replace(/\s+/g, '-')}-${formData.aspectRatio.replace(':', 'x')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">BannerAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasApiKey ? (
              <button 
                onClick={handleConnectKey}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                <Key className="w-4 h-4" />
                Connect API Key
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                API Connected
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!hasApiKey ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
              Create Stunning Banner Ads <br />
              <span className="text-emerald-500">Powered by Gemini 3 Pro</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10">
              Generate high-quality, professional-grade banner ads in any standard size. 
              Connect your Gemini API key to get started.
            </p>
            <button 
              onClick={handleConnectKey}
              className="px-8 py-4 bg-emerald-500 text-black rounded-full text-lg font-bold hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
            >
              Get Started with API Key
            </button>
            <p className="mt-6 text-sm text-gray-500">
              Requires a paid Google Cloud project. <br />
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">
                Learn more about billing
              </a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Controls */}
            <div className="lg:col-span-5 space-y-8">
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Ad Configuration
                </h2>
                
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Lumina Smart Watch"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      value={formData.productName}
                      onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Description</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe the product, its key features, and the target audience..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                      value={formData.productDescription}
                      onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Call to Action</label>
                      <input 
                        type="text"
                        placeholder="e.g. Shop Now"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        value={formData.cta}
                        onChange={(e) => setFormData({...formData, cta: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target URL</label>
                      <input 
                        type="url"
                        placeholder="https://example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        value={formData.aspectRatio}
                        onChange={(e) => setFormData({...formData, aspectRatio: e.target.value as AspectRatio})}
                      >
                        {ASPECT_RATIOS.map((ratio) => (
                          <option key={ratio.value} value={ratio.value} className="bg-[#1A1A1A]">{ratio.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Image Size</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        value={formData.imageSize}
                        onChange={(e) => setFormData({...formData, imageSize: e.target.value as ImageSize})}
                      >
                        {IMAGE_SIZES.map((size) => (
                          <option key={size} value={size} className="bg-[#1A1A1A]">{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 text-black rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Banner
                      </>
                    )}
                  </button>
                </form>
              </section>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-7">
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Ad Preview
                  </h2>
                  {generatedImage && (
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Ad
                    </button>
                  )}
                </div>

                <div className="relative aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 text-center px-6"
                      >
                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-emerald-500 font-medium animate-pulse">{loadingMessage}</p>
                        <p className="text-gray-500 text-sm max-w-xs">This may take up to a minute. High-quality image generation is in progress.</p>
                      </motion.div>
                    ) : generatedImage ? (
                      <motion.div 
                        key="image"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex items-center justify-center p-4"
                      >
                        <img 
                          src={generatedImage} 
                          alt="Generated Banner" 
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-4 px-6"
                      >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 font-medium">No banner generated yet</p>
                          <p className="text-gray-600 text-sm max-w-xs mx-auto">Configure your ad details and click generate to see the magic happen.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {generatedImage && (
                  <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{formData.productName}</h3>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        {formData.aspectRatio} • {formData.imageSize}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{formData.productDescription}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <button className="px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors">
                        {formData.cta}
                      </button>
                      {formData.targetUrl && (
                        <a 
                          href={formData.targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {new URL(formData.targetUrl).hostname}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Gemini 3 Pro Image Preview</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
