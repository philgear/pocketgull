import { TestBed } from '@angular/core/testing';
import { ImageOptimizationService } from './image-optimization.service';

describe('ImageOptimizationService', () => {
  let service: ImageOptimizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageOptimizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('standardizeWikipediaUrl', () => {
    it('should snap 640px to 960px', () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/640px-File.jpg';
      const expected = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/960px-File.jpg';
      expect(service.standardizeWikipediaUrl(url)).toBe(expected);
    });

    it('should snap 220px to 250px', () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/220px-File.jpg';
      const expected = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/250px-File.jpg';
      expect(service.standardizeWikipediaUrl(url)).toBe(expected);
    });

    it('should handle custom target width (e.g., 500px)', () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/640px-File.jpg';
      const expected = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/500px-File.jpg';
      expect(service.standardizeWikipediaUrl(url, 500)).toBe(expected);
    });

    it('should return original URL if not from Wikimedia', () => {
      const url = 'https://example.com/image.jpg';
      expect(service.standardizeWikipediaUrl(url)).toBe(url);
    });

    it('should return original URL if no size pattern found', () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/1/1a/File.jpg';
      expect(service.standardizeWikipediaUrl(url)).toBe(url);
    });
  });
});
