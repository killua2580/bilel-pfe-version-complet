// performance.js - Utilitaires de performance pour Gym Power

// Mesure des performances
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    startTimer(name) {
        this.metrics[name] = performance.now();
    }

    endTimer(name) {
        if (this.metrics[name]) {
            const duration = performance.now() - this.metrics[name];
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
    }

    measureFunction(fn, name) {
        return async (...args) => {
            this.startTimer(name);
            const result = await fn(...args);
            this.endTimer(name);
            return result;
        };
    }
}

// Instance globale du moniteur de performance
window.perfMonitor = new PerformanceMonitor();

// Optimisation des requêtes API
class APIOptimizer {
    constructor(api) {
        this.api = api;
        this.queryCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async cachedRequest(endpoint, method = 'GET', data = null, cacheKey) {
        const cached = this.queryCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            console.log(`Cache hit for ${cacheKey}`);
            return cached.data;
        }

        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        const response = await this.api.makeRequest(endpoint, method, data);
        
        if (response.data) {
            this.queryCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }

        return response.data;
    }

    invalidateCache(pattern) {
        for (const key of this.queryCache.keys()) {
            if (key.includes(pattern)) {
                this.queryCache.delete(key);
            }
        }
    }

    clearCache() {
        this.queryCache.clear();
    }
}

// Optimisation des images
class ImageOptimizer {
    static lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    static optimizeImageLoading() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    }
}

// Optimisation du DOM
class DOMOptimizer {
    static batchDOMUpdates(updates) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                updates.forEach(update => update());
                resolve();
            });
        });
    }

    static createElementFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    static replaceContent(container, newContent) {
        const fragment = document.createDocumentFragment();
        
        if (Array.isArray(newContent)) {
            newContent.forEach(item => {
                if (typeof item === 'string') {
                    fragment.appendChild(this.createElementFromHTML(item));
                } else {
                    fragment.appendChild(item);
                }
            });
        } else {
            fragment.appendChild(newContent);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }
}

// Optimisation des événements
class EventOptimizer {
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    static delegateEvent(container, selector, event, handler) {
        container.addEventListener(event, function(e) {
            if (e.target.matches(selector)) {
                handler.call(e.target, e);
            }
        });
    }
}

// Optimisation de la mémoire
class MemoryOptimizer {
    static cleanupEventListeners(element) {
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }

    static weakMapCache() {
        return new WeakMap();
    }

    static observeMemoryUsage() {
        if ('memory' in performance) {
            console.log('Memory usage:', {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
            });
        }
    }
}

// Initialisation des optimisations
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'optimiseur API
    if (window.api) {
        window.apiOptimizer = new APIOptimizer(window.api);
    }

    // Optimiser les images
    ImageOptimizer.optimizeImageLoading();
    ImageOptimizer.lazyLoadImages();

    // Observer l'utilisation de la mémoire en mode développement
    if (window.location.hostname === 'localhost') {
        setInterval(() => {
            MemoryOptimizer.observeMemoryUsage();
        }, 30000); // Toutes les 30 secondes
    }

    console.log('Performance optimizations initialized');
});

// Export des classes pour utilisation globale
window.PerformanceMonitor = PerformanceMonitor;
window.APIOptimizer = APIOptimizer;
window.ImageOptimizer = ImageOptimizer;
window.DOMOptimizer = DOMOptimizer;
window.EventOptimizer = EventOptimizer;
window.MemoryOptimizer = MemoryOptimizer;

