// script.js - Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        let theme;
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            theme = 'light';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });
    
    // Fetch thumbnails
    const fetchBtn = document.getElementById('fetch-btn');
    const videoUrlInput = document.getElementById('video-url');
    const qualityOptions = document.getElementById('quality-options');
    const thumbnailsGrid = document.querySelector('.thumbnails-grid');
    const editorSection = document.getElementById('editor-section');
    
    fetchBtn.addEventListener('click', fetchThumbnails);
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchThumbnails();
    });
    
    function fetchThumbnails() {
        const url = videoUrlInput.value.trim();
        if (!url) {
            alert('Please enter a YouTube video URL');
            return;
        }
        
        // Extract video ID
        let videoId;
        try {
            videoId = extractVideoId(url);
            if (!videoId) throw new Error('Invalid URL');
        } catch (e) {
            alert('Please enter a valid YouTube video URL');
            return;
        }
        
        // Show loading state
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Generate thumbnail URLs
        const thumbnails = generateThumbnailUrls(videoId);
        
        // Display thumbnails
        displayThumbnails(thumbnails, videoId);
        
        // Reset button
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Get Thumbnails';
    }
    
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    function generateThumbnailUrls(videoId) {
        return {
            'maxres': `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            'hq': `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            'mq': `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            'sd': `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
            'default': `https://img.youtube.com/vi/${videoId}/default.jpg`
        };
    }
    
    function displayThumbnails(thumbnails, videoId) {
        thumbnailsGrid.innerHTML = '';
        
        // Create thumbnail cards for each quality
        for (const [quality, url] of Object.entries(thumbnails)) {
            const qualityNames = {
                'maxres': '4K (Maximum Resolution)',
                'hq': 'HD (High Quality)',
                'mq': 'Medium Quality',
                'sd': 'Standard Definition',
                'default': 'Default Quality'
            };
            
            const card = document.createElement('div');
            card.className = 'thumbnail-card';
            card.innerHTML = `
                <img src="${url}" alt="YouTube thumbnail" class="thumbnail-img" onerror="this.parentNode.remove()">
                <div class="thumbnail-info">
                    <h4>${qualityNames[quality] || quality}</h4>
                    <div class="btn-group">
                        <a href="${url}" download="yt-thumbnail-${videoId}-${quality}.jpg" class="download-btn">
                            <i class="fas fa-download"></i> Download
                        </a>
                        <button class="tool-btn edit-btn" data-url="${url}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
            
            thumbnailsGrid.appendChild(card);
        }
        
        // Show quality options
        qualityOptions.classList.remove('hidden');
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const imgUrl = this.getAttribute('data-url');
                openEditor(imgUrl);
            });
        });
    }
    
    function openEditor(imgUrl) {
        // In a real implementation, this would initialize the editor with the image
        editorSection.classList.remove('hidden');
        
        // Scroll to editor
        editorSection.scrollIntoView({ behavior: 'smooth' });
        
        // Initialize editor (this would be more complex in a real implementation)
        initEditor(imgUrl);
    }
    
    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = answer.classList.contains('show');
            
            // Close all answers first
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('show');
            });
            faqQuestions.forEach(q => {
                q.classList.remove('active');
            });
            
            // Open current if it was closed
            if (!isOpen) {
                answer.classList.add('show');
                question.classList.add('active');
            }
        });
    });
});

// editor.js - Image editor functionality
function initEditor(imageUrl) {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
    
    // Set up editor tools
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
    const editorSidebar = document.getElementById('editor-sidebar');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            activateTool(tool);
        });
    });
    
    function activateTool(tool) {
        // Reset active state
        toolButtons.forEach(btn => btn.classList.remove('active'));
        
        // Activate current tool
        const activeBtn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
        activeBtn.classList.add('active');
        
        // Show tool options in sidebar
        editorSidebar.innerHTML = getToolOptions(tool);
        editorSidebar.classList.remove('hidden');
    }
    
    function getToolOptions(tool) {
        // This would return different UI for each tool
        switch(tool) {
            case 'text':
                return `
                    <h3>Text Tool</h3>
                    <input type="text" placeholder="Enter text" id="text-input">
                    <div class="color-picker">
                        <label>Text Color:</label>
                        <input type="color" id="text-color" value="#ffffff">
                    </div>
                    <div class="size-selector">
                        <label>Font Size:</label>
                        <input type="range" id="text-size" min="10" max="72" value="24">
                    </div>
                    <button id="add-text-btn">Add Text</button>
                `;
            // Other tools would have their own UI
            default:
                return `<h3>${tool} Options</h3><p>Tool options will appear here</p>`;
        }
    }
    
    // Download edited image
    document.getElementById('download-edited').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'edited-thumbnail.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    });
}

// language.js - Internationalization
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('language-select');
    
    // Load saved language preference
    const savedLang = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLang;
    
    // Change language
    languageSelect.addEventListener('change', function() {
        const lang = this.value;
        localStorage.setItem('language', lang);
        applyLanguage(lang);
    });
    
    function applyLanguage(lang) {
        // This would be replaced with actual translations in a real app
        const translations = {
            en: {
                'download-title': 'Download YouTube Thumbnails',
                'placeholder': 'Paste YouTube video URL here...',
                'fetch-btn': 'Get Thumbnails',
                'available-qualities': 'Available Thumbnail Qualities',
                'edit-title': 'Edit Thumbnail',
                'features-title': 'Supported Features',
                'faq-title': 'Frequently Asked Questions'
            },
            // Other languages would have their translations here
        };
        
        // Apply translations to elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
    }
});
