import { Pipe, PipeTransform, inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import * as DOMPurify from 'dompurify';

@Pipe({
    name: 'safeHtml',
    standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    constructor() {}

    transform(value: string): SafeHtml {
        if (!value) return value;
        
        let cleanHtml = value;
        const purify = (DOMPurify as any).default || DOMPurify;
        
        if (this.isBrowser && typeof purify.sanitize === 'function') {
            cleanHtml = purify.sanitize(value, {
                ADD_TAGS: ['svg', 'path', 'g', 'circle', 'line', 'polygon', 'rect'],
                ADD_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd']
            });
        }
        
        return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    }
}
