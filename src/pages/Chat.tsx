import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatBox } from '@/features/chat/ChatBox';

const Chat = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('chat.title')}</h1>
        <div className="max-w-4xl mx-auto">
          <ChatBox />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;