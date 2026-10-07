import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';

export const metadata: Metadata = {
  title: 'Real-Time Messaging | Production Chat',
  description: 'Decoupled real-time chat application built with Next.js, Express, Socket.IO and Valkey/Kafka abstractions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
