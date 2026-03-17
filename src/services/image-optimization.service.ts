import { Injectable } from '@angular/core';
import { getStandardWikimediaSize } from '../constants/image-sizes';

/**
 * Service to handle image URL standardization and optimization.
 */
@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {

  /**
   * Standardizes a Wikipedia thumbnail URL to use recommended production sizes.
   * Example: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/640px-File.jpg
   * becomes: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/960px-File.jpg
   * 
   * @param url The Wikipedia thumbnail URL to standardize.
   * @param targetWidth Optional target width. If not provided, it snaps current size to the next standard bucket.
   * @returns The standardized URL.
   */
  standardizeWikipediaUrl(url: string, targetWidth?: number): string {
    if (!url.includes('upload.wikimedia.org')) {
      return url;
    }

    // Match the size part of the URL, e.g., /640px-
    const sizeMatch = url.match(/\/(\d+)px-/);
    if (!sizeMatch) {
      // Not a standard thumbnail URL or already at original resolution
      return url;
    }

    const currentWidth = parseInt(sizeMatch[1], 10);
    const widthToUse = targetWidth !== undefined ? targetWidth : currentWidth;
    const standardWidth = getStandardWikimediaSize(widthToUse);

    // Replace the size in the URL
    return url.replace(`/${currentWidth}px-`, `/${standardWidth}px-`);
  }
}
