

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#00357f",
                "on-primary": "#ffffff",
                "primary-container": "#004aad",
                "on-primary-container": "#a9c1ff",
                "primary-fixed": "#d9e2ff",
                "primary-fixed-dim": "#b0c6ff",
                "on-primary-fixed": "#001945",
                "on-primary-fixed-variant": "#00429b",
                "secondary": "#1b6d24",
                "on-secondary": "#ffffff",
                "secondary-container": "#a0f399",
                "on-secondary-container": "#217128",
                "secondary-fixed": "#a3f69c",
                "secondary-fixed-dim": "#88d982",
                "on-secondary-fixed": "#002204",
                "on-secondary-fixed-variant": "#005312",
                "tertiary": "#6d191e",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#8c3033",
                "on-tertiary-container": "#ffacaa",
                "tertiary-fixed": "#ffdad8",
                "tertiary-fixed-dim": "#ffb3b1",
                "on-tertiary-fixed": "#410007",
                "on-tertiary-fixed-variant": "#80272b",
                "surface": "#f8f9fa",
                "on-surface": "#191c1d",
                "surface-variant": "#e1e3e4",
                "on-surface-variant": "#434653",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f3f4f5",
                "surface-container": "#edeeef",
                "surface-container-high": "#e7e8e9",
                "surface-container-highest": "#e1e3e4",
                "outline": "#737784",
                "outline-variant": "#c3c6d5",
                "inverse-surface": "#2e3132",
                "inverse-on-surface": "#f0f1f2",
                "surface-bright": "#f8f9fa",
                "surface-dim": "#d9dadb",
                "surface-tint": "#215abd",
                "error": "#ba1a1a",
                "on-error": "#ffffff",
                "error-container": "#ffdad6",
                "on-error-container": "#93000a",
            }
        },
    },
    plugins: [],
}