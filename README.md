# PixelScale

PixelScale is a PNG-focused image upscaler that enlarges images with either nearest-neighbor or bicubic interpolation.

## Table of Contents

- [What It Does](#what-it-does)
- [How It Works](#how-it-works)
- [Quick Comparison](#quick-comparison)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [License](#license)

## What It Does

- Upscales PNG images by integer scale factors (2x, 3x, 4x, 8x)
- Lets you choose the upscaling algorithm: nearest-neighbor or bicubic
- Preserves pixel-art sharpness with nearest-neighbor and offers smoother gradients with bicubic
- Shows side-by-side original and upscaled previews
- Exports the upscaled result as a PNG file

## How It Works

1. You upload a PNG image.
2. The app reads pixel data from a canvas.
3. You select an algorithm:
	- Nearest-neighbor duplicates each source pixel into larger blocks
	- Bicubic blends surrounding pixels using weighted interpolation
4. The transformed pixel data is rendered for preview and can be downloaded as a PNG.

## Quick Comparison

- **Nearest-neighbor:** sharp, blocky, pixel-perfect - ideal for pixel art, but can look jagged when upscaling photos.
- **Bicubic:** smoother transitions, less stair-step aliasing - better for photos.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- PostCSS + Autoprefixer
- ESLint
- gh-pages (for deployment workflow)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Clone the Repository

```bash
git clone https://github.com/Agam-S/PixelScale

cd PixelScale
```

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Open the app in your browser.
2. Drag and drop a PNG (or click the upload zone).
3. Pick an algorithm and a scale factor.
4. Review the upscaled preview.
5. Click export to download the generated PNG.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

See [LICENSE.txt](LICENSE.txt) for the full license text.
