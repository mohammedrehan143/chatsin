import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';

export const metadata: Metadata = {
  title: 'WhatsApp Web | Real-Time Messaging',
  description: 'Production real-time WhatsApp-style messaging application with mobile number authentication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="h-screen w-screen overflow-hidden bg-[#d1d7db] text-[#111b21] antialiased">
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
