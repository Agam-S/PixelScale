export type UpscaleAlgorithm = 'nearest' | 'bicubic';

interface AxisSample {
    i0: number;
    i1: number;
    i2: number;
    i3: number;
    w0: number;
    w1: number;
    w2: number;
    w3: number;
}

// clamp function ensures that a value stays within the specified min and max bounds.
function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
// clampByte is a specialized version of clamp that ensures a value stays within the 0-255 range, which is essential for valid RGBA color values in image processing.
function clampByte(value: number): number {
    if (value <= 0) return 0;
    if (value >= 255) return 255;
    return value;
}

// cubicWeight calculates the weight for a given distance based on the cubic convolution formula, which is used in bicubic interpolation to determine how much influence neighboring pixels have on the output pixel value.
function cubicWeight(distance: number): number {
    const a = -0.5;
    const x = Math.abs(distance);
    if (x <= 1) return (a + 2) * x * x * x - (a + 3) * x * x + 1;
    if (x < 2) return a * x * x * x - 5 * a * x * x + 8 * a * x - 4 * a;
    return 0;
}

// buildAxisSamples precomputes the indices and weights for each target pixel along one axis (horizontal or vertical) based on the source image size, target size, and scale factor.
function buildAxisSamples(targetSize: number, sourceSize: number, scale: number): AxisSample[] {
    const samples = new Array<AxisSample>(targetSize);

    for (let target = 0; target < targetSize; target++) {
        const source = (target + 0.5) / scale - 0.5;
        const base = Math.floor(source);

        const p0 = clamp(base - 1, 0, sourceSize - 1);
        const p1 = clamp(base, 0, sourceSize - 1);
        const p2 = clamp(base + 1, 0, sourceSize - 1);
        const p3 = clamp(base + 2, 0, sourceSize - 1);

        const w0 = cubicWeight(source - (base - 1));
        const w1 = cubicWeight(source - base);
        const w2 = cubicWeight(source - (base + 1));
        const w3 = cubicWeight(source - (base + 2));
        const sum = w0 + w1 + w2 + w3 || 1;

        samples[target] = {
            i0: p0,
            i1: p1,
            i2: p2,
            i3: p3,
            w0: w0 / sum,
            w1: w1 / sum,
            w2: w2 / sum,
            w3: w3 / sum,
        };
    }

    return samples;
}


function upscaleNearest(image: ImageData, scale: number): ImageData {

    const { width, height, data } = image;
    const newHeight = height * scale;
    const newWidth = width * scale;

    // Info: uint8clampedarray is a typed array that represents an array of 8-bit unsigned integers clamped to 0-255. 
    // It is used to store pixel data in the RGBA format, where each pixel is represented by four values (red, green, blue, and alpha).

    // multiply the width and height by 4 because each pixel is represented by 4 values (red, green, blue, and alpha)
    const newImageData = new Uint8ClampedArray(newWidth * newHeight * 4);

    // Loop through each pixel in the original image and copy it to the new image data array, scaling it up by the specified factor.
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate the index of the current pixel in the original image data array. 
            // The index is calculated by multiplying the y-coordinate by the width of the image, adding the x-coordinate, and then multiplying by 4 (since each pixel has 4 values).
            const index = (y * width + x) * 4;
            // image values in RGBA
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Creating the NxN (scaled) block
            const baseY = y * scale;
            const baseX = x * scale;

            for (let i = 0; i < scale; i++) {
                // Calculate the starting index for the current row in the new image data array.
                const row = (baseY + i) * newWidth;
                for (let j = 0; j < scale; j++) {
                    // Calculate the index for the current pixel in the new image data array.
                    const newIndex = (row + baseX + j) * 4;
                    // Set the RGBA values for the current pixel in the new image data array.
                    newImageData[newIndex] = r;       // Red
                    newImageData[newIndex + 1] = g;   // Green
                    newImageData[newIndex + 2] = b;   // Blue
                    newImageData[newIndex + 3] = a;   // Alpha
                }
            }
        }
    }
    // Return a new ImageData object created from the new image data array, with the new width and height.
    return new ImageData(newImageData, newWidth, newHeight);
}

function upscaleBicubic(image: ImageData, scale: number): ImageData {
    const { width, height, data } = image;
    const newWidth = width * scale;
    const newHeight = height * scale;
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);

    // Build sampling tables for both axes
    const xSamples = buildAxisSamples(newWidth, width, scale);
    const ySamples = buildAxisSamples(newHeight, height, scale);

    // Loop through each pixel in the output image, calculate the corresponding source pixels and their weights using the precomputed sampling tables, and apply the bicubic interpolation formula to compute the final color values for each output pixel.
    for (let y = 0; y < newHeight; y++) {
        const ys = ySamples[y];
        const y0 = ys.i0 * width;
        const y1 = ys.i1 * width;
        const y2 = ys.i2 * width;
        const y3 = ys.i3 * width;

        for (let x = 0; x < newWidth; x++) {
            const xs = xSamples[x];

            const idx00 = (y0 + xs.i0) * 4;
            const idx01 = (y0 + xs.i1) * 4;
            const idx02 = (y0 + xs.i2) * 4;
            const idx03 = (y0 + xs.i3) * 4;
            const idx10 = (y1 + xs.i0) * 4;
            const idx11 = (y1 + xs.i1) * 4;
            const idx12 = (y1 + xs.i2) * 4;
            const idx13 = (y1 + xs.i3) * 4;
            const idx20 = (y2 + xs.i0) * 4;
            const idx21 = (y2 + xs.i1) * 4;
            const idx22 = (y2 + xs.i2) * 4;
            const idx23 = (y2 + xs.i3) * 4;
            const idx30 = (y3 + xs.i0) * 4;
            const idx31 = (y3 + xs.i1) * 4;
            const idx32 = (y3 + xs.i2) * 4;
            const idx33 = (y3 + xs.i3) * 4;

            const rowWeight0 = ys.w0;
            const rowWeight1 = ys.w1;
            const rowWeight2 = ys.w2;
            const rowWeight3 = ys.w3;

            const colWeight0 = xs.w0;
            const colWeight1 = xs.w1;
            const colWeight2 = xs.w2;
            const colWeight3 = xs.w3;

            const outIndex = (y * newWidth + x) * 4;
            // For each color channel (red, green, blue, alpha), calculate the weighted sum of the 16 surrounding pixels in the source image using the precomputed weights for both axes, and store the result in the output array.
            for (let c = 0; c < 4; c++) {
                const v0 = data[idx00 + c] * colWeight0 + data[idx01 + c] * colWeight1 + data[idx02 + c] * colWeight2 + data[idx03 + c] * colWeight3;
                const v1 = data[idx10 + c] * colWeight0 + data[idx11 + c] * colWeight1 + data[idx12 + c] * colWeight2 + data[idx13 + c] * colWeight3;
                const v2 = data[idx20 + c] * colWeight0 + data[idx21 + c] * colWeight1 + data[idx22 + c] * colWeight2 + data[idx23 + c] * colWeight3;
                const v3 = data[idx30 + c] * colWeight0 + data[idx31 + c] * colWeight1 + data[idx32 + c] * colWeight2 + data[idx33 + c] * colWeight3;
                // The clampByte function is used to ensure that the resulting color values are valid RGBA values between 0 and 255.
                output[outIndex + c] = clampByte(v0 * rowWeight0 + v1 * rowWeight1 + v2 * rowWeight2 + v3 * rowWeight3);
            }
        }
    }

    return new ImageData(output, newWidth, newHeight);
}

export function upscalePixels(image: ImageData, scale: number, algorithm: UpscaleAlgorithm = 'nearest'): ImageData {
    if (algorithm === 'bicubic') {
        return upscaleBicubic(image, scale);
    }

    return upscaleNearest(image, scale);
}
