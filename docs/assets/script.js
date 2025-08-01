// InSite Documentation Site JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality for code examples
    initializeTabs();
    
    // Smooth scrolling for navigation links
    initializeSmoothScrolling();
    
    // Mobile navigation toggle
    initializeMobileNav();
    
    // Copy to clipboard for code blocks
    initializeCodeCopy();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeMobileNav() {
    // Add mobile menu toggle if needed
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav-links');
    
    // Check if we need mobile navigation
    if (window.innerWidth <= 768) {
        // Create mobile menu button if it doesn't exist
        let mobileToggle = document.querySelector('.mobile-toggle');
        if (!mobileToggle) {
            mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-toggle';
            mobileToggle.innerHTML = '☰';
            mobileToggle.style.cssText = `
                display: none;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-primary);
                cursor: pointer;
            `;
            
            nav.appendChild(mobileToggle);
            
            mobileToggle.addEventListener('click', () => {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }
}

function initializeCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const wrapper = block.parentElement;
        wrapper.style.position = 'relative';
        
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-btn';
        copyButton.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            opacity: 0.8;
            transition: opacity 0.2s;
        `;
        
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                copyButton.textContent = 'Failed';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            }
        });
        
        copyButton.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });
        
        copyButton.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0.8';
        });
        
        wrapper.appendChild(copyButton);
    });
}

// Add scroll-to-top functionality
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollTopBtn = document.querySelector('.scroll-top');
    
    if (scrollTop > 300 && !scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top';
        scrollTopBtn.innerHTML = '↑';
        scrollTopBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            border: none;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        document.body.appendChild(scrollTopBtn);
    } else if (scrollTop <= 300 && scrollTopBtn) {
        scrollTopBtn.remove();
    }
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.overview-card, .feature-category, .benefit');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        observer.observe(el);
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .mobile-toggle {
        display: none !important;
    }
    
    @media (max-width: 768px) {
        .mobile-toggle {
            display: block !important;
        }
        
        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-primary);
            flex-direction: column;
            padding: 1rem;
            box-shadow: var(--shadow-md);
            border-top: 1px solid var(--border-color);
        }
        
        .nav-links.active {
            display: flex;
        }
    }
`;
document.head.appendChild(style);

// Initialize animations after page load
window.addEventListener('load', animateOnScroll);