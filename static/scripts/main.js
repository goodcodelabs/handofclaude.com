// Enhanced reading experience
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add reading progress indicator for entries
    const postContent = document.querySelector('.post-content');
    if (postContent) {
        createReadingProgress();
    }

    // Enhance code blocks
    enhanceCodeBlocks();

    // Add copy functionality to code blocks
    addCopyButtons();
});

function createReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';

    // Add CSS for progress bar
    const style = document.createElement('style');
    style.textContent = `
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: var(--steel-gray);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .reading-progress.visible {
            opacity: 1;
        }
        
        .reading-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--blue), var(--purple));
            width: 0%;
            transition: width 0.1s ease;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(progressBar);

    const progressBarFill = progressBar.querySelector('.reading-progress-bar');

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const scrollPercentage = (scrollTop / documentHeight) * 100;

        progressBarFill.style.width = Math.min(scrollPercentage, 100) + '%';

        // Show progress bar when scrolling
        if (scrollTop > 100) {
            progressBar.classList.add('visible');
        } else {
            progressBar.classList.remove('visible');
        }
    });
}

function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        pre.style.position = 'relative';

        // Add language label if available
        const className = block.className;
        const languageMatch = className.match(/language-(\w+)/);

        if (languageMatch) {
            const language = languageMatch[1];
            const label = document.createElement('span');
            label.textContent = language.toUpperCase();
            label.className = 'code-language';

            // Add CSS for language label
            if (!document.querySelector('#code-enhancement-styles')) {
                const style = document.createElement('style');
                style.id = 'code-enhancement-styles';
                style.textContent = `
                    .code-language {
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        background-color: var(--steel-gray);
                        color: var(--green);
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        font-size: 0.75rem;
                        font-weight: 500;
                        font-family: 'JetBrains Mono', monospace;
                    }
                    
                    .copy-button {
                        position: absolute;
                        top: 0.5rem;
                        right: 4rem;
                        background-color: var(--steel-gray);
                        color: var(--blue);
                        border: none;
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        font-size: 0.75rem;
                        font-weight: 500;
                        font-family: 'JetBrains Mono', monospace;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .copy-button:hover {
                        background-color: var(--blue);
                        color: var(--charcoal);
                    }
                    
                    .copy-button.copied {
                        background-color: var(--green);
                        color: var(--charcoal);
                    }
                `;
                document.head.appendChild(style);
            }

            pre.appendChild(label);
        }
    });
}

function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'copy-button';

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
                button.textContent = 'Error';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            }
        });

        pre.appendChild(button);
    });
}

// Theme enhancement utilities
function addImageLightbox() {
    const images = document.querySelectorAll('.post-content img, .page-content img');

    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            createLightbox(img.src, img.alt);
        });
    });
}

function createLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${src}" alt="${alt}">
            <button class="lightbox-close">&times;</button>
        </div>
    `;

    // Add lightbox styles if not already present
    if (!document.querySelector('#lightbox-styles')) {
        const style = document.createElement('style');
        style.id = 'lightbox-styles';
        style.textContent = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(34, 34, 35, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                opacity: 0;
                animation: fadeIn 0.3s ease forwards;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            
            .lightbox img {
                max-width: 100%;
                max-height: 100%;
                border-radius: 0.5rem;
            }
            
            .lightbox-close {
                position: absolute;
                top: -2rem;
                right: -2rem;
                background: none;
                border: none;
                color: var(--foreground);
                font-size: 2rem;
                cursor: pointer;
                width: 3rem;
                height: 3rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background-color: var(--steel-gray);
                transition: background-color 0.2s ease;
            }
            
            .lightbox-close:hover {
                background-color: var(--red);
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(lightbox);

    // Close lightbox functionality
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const closeLightbox = () => {
        lightbox.style.opacity = '0';
        setTimeout(() => document.body.removeChild(lightbox), 300);
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
    });
}

// Initialize image lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', addImageLightbox);