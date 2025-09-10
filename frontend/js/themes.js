// Theme handling for authentication pages

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const themeCSS = document.getElementById('theme-css');
    
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Load the appropriate theme CSS
    loadTheme(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Add theme switching class to prevent transition flashing
            document.body.classList.add('theme-switching');
            
            // Load new theme
            loadTheme(newTheme);
            
            // Remove theme switching class after a short delay
            setTimeout(() => {
                document.body.classList.remove('theme-switching');
            }, 100);
        });
    }
    
    function loadTheme(theme) {
        // Update HTML data attribute
        html.setAttribute('data-theme', theme);
        
        // Update theme CSS file
        const themeFileName = theme === 'dark' ? 'dark-theme.css' : 'light-theme.css';
        if (themeCSS) {
            themeCSS.href = `../css/${themeFileName}`;
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Update toggle icon
        updateThemeIcon(theme);
        
        console.log(`Theme switched to: ${theme}`);
    }
    
    function updateThemeIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                icon.title = 'Switch to light mode';
            } else {
                icon.className = 'fas fa-moon';
                icon.title = 'Switch to dark mode';
            }
        }
    }
});
