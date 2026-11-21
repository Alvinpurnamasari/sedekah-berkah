
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

import '../css/app.css';

const pages = import.meta.glob('./Pages/**/*.jsx', {
    eager: true,
});

createInertiaApp({
    resolve: (name) => {
        const path = `./Pages/${name}.jsx`;
        const page = pages[path];

        if (!page) {
            console.error('Halaman Inertia tidak ditemukan:', path);
            console.error('Daftar halaman yang tersedia:', Object.keys(pages));

            throw new Error(`Halaman ${path} tidak ditemukan.`);
        }

        return page;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});

// Service Worker sementara dinonaktifkan untuk pemeriksaan.
