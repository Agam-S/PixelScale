export function upscalePixels(image: ImageData, scale: number): ImageData {
    
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