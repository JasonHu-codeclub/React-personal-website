import {defineConfig} from "vite";
import Icons from 'unplugin-icons/vite';
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({

    optimizeDeps: {
        esbuildOptions: {
            target: 'es2020',
        },
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    'babel-plugin-macros',
                    [
                        '@emotion/babel-plugin-jsx-pragmatic',
                        {
                            export: 'jsx',
                            import: '__cssprop',
                            module: '@emotion/react',
                        },
                    ],
                    // ['@babel/plugin-transform-react-jsx', {pragma: '__cssprop'}, 'twin.macro'],
                ],
            },
        }),
        Icons({
            compiler: "jsx",
            jsx: "react",
            scale: 1.2,
        }),
    ],
})
;
