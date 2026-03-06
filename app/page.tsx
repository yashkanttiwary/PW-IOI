'use client';

import React from 'react';
import { AppProvider } from '../src/store/appStore';
import App from '../src/App';

export default function Page() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
