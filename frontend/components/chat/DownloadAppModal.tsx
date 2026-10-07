'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Laptop,
  Globe,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // Capture native PWA install prompt in Chrome / Edge
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDownloadSuccess('Chatsin Chrome App installed successfully!');
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction
      downloadChromeShortcut();
    }
  };

  const downloadWindowsLauncher = () => {
    if (typeof window === 'undefined') return;
    const appUrl = window.location.origin;

    // Windows batch script that launches Chrome or Edge in standalone app window
    const scriptContent = `@echo off
:: Chatsin Desktop Launcher
title Chatsin Desktop
echo Starting Chatsin Desktop App...
start "" msedge --app="${appUrl}" || start "" chrome --app="${appUrl}" || start "" "${appUrl}"
exit
`;

    const blob = new Blob([scriptContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chatsin-Desktop.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Windows launcher downloaded! Run Chatsin-Desktop.bat to launch.');
  };

  const downloadChromeShortcut = () => {
    if (typeof window === 'undefined') return;
    const appUrl = window.location.origin;

    // Standard internet shortcut (.url)
    const shortcutContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconIndex=0\r\nIconFile=${appUrl}/icon.svg\r\nHotKey=0\r\n`;

    const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chatsin.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Chrome desktop shortcut downloaded! Drag to your Desktop or Taskbar.');
  };

  const handleClose = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('chatsin_hide_install_popup', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#09090b] text-white p-6 relative flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-inner">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/15 rounded-full text-[10px] font-semibold text-zinc-200 uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Download App</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Get Chatsin for Chrome & Desktop</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Install as a dedicated standalone app with desktop notifications
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Option 1: Chrome Extension / Web App */}
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-[#09090b] shrink-0 shadow-2xs">
                <Globe className="w-5 h-5 text-[#09090b]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#09090b]">Google Chrome App</h3>
                  <span className="px-1.5 py-0.5 text-[10px] bg-zinc-200 font-semibold rounded text-zinc-800">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed">
                  Fastest way to use Chatsin. Launches as an independent window with 0 tab clutter.
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>Tip: Look for the install icon ⊕ in Chrome’s address bar</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 flex flex-col gap-1.5">
              <button
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#09090b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{deferredPrompt ? 'Install to Chrome' : 'Add to Chrome'}</span>
              </button>
              <button
                onClick={downloadChromeShortcut}
                className="w-full sm:w-auto px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-black hover:bg-zinc-200/50 rounded-lg transition-colors text-center cursor-pointer"
              >
                Download Shortcut (.url)
              </button>
            </div>
          </div>

          {/* Option 2: Windows Desktop Standalone Launcher */}
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-[#09090b] shrink-0 shadow-2xs">
                <Laptop className="w-5 h-5 text-[#09090b]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#09090b]">Windows Desktop Launcher</h3>
                <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed">
                  Launches Chatsin in borderless desktop app mode with instant desktop alerts.
                </p>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Includes native taskbar integration & persistent login.
                </span>
              </div>
            </div>

            <button
              onClick={downloadWindowsLauncher}
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-[#09090b] text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#09090b]" />
              <span>Download (.bat)</span>
            </button>
          </div>

          {/* Option 3: Mobile (Android / iOS) */}
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-[#09090b] shrink-0 shadow-2xs">
              <Smartphone className="w-5 h-5 text-[#09090b]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#09090b]">Mobile App (Android & iOS)</h3>
              <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed">
                Open Chatsin in mobile Chrome or Safari, tap <strong>Share</strong> (or Menu ⋮), then select{' '}
                <strong>&ldquo;Add to Home Screen&rdquo;</strong> to install the full mobile app.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free, lightweight & auto-updating</span>
            </div>
            {isInstalled && (
              <span className="text-emerald-600 font-medium">✓ App is already running in standalone mode</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-zinc-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 accent-[#09090b] cursor-pointer"
            />
            <span>Don&apos;t show this popup on startup</span>
          </label>

          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
