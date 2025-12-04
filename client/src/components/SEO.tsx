import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
}

export default function SEO({
    title,
    description,
    image = '/og-image.jpg',
    url = 'https://rodactiva.pt',
    type = 'website'
}: SEOProps) {
    const siteTitle = 'Rodactiva - BTT e Trail em Castro Marim';
    const fullTitle = `${title} | ${siteTitle}`;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Helper function to update or create meta tag
        const updateMetaTag = (selector: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${selector}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, selector);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Update standard metadata
        updateMetaTag('description', description);

        // Update Open Graph / Facebook
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:title', fullTitle, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);

        // Update Twitter
        updateMetaTag('twitter:card', 'summary_large_image', true);
        updateMetaTag('twitter:url', url, true);
        updateMetaTag('twitter:title', fullTitle, true);
        updateMetaTag('twitter:description', description, true);
        updateMetaTag('twitter:image', image, true);

        // Update canonical link
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }, [title, description, image, url, type, fullTitle]);

    return null;
}

