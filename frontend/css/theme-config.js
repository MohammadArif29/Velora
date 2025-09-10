// Velora Theme Configuration
// This file contains theme configuration for easy management

const VELORA_THEMES = {
    dark: {
        name: 'Dark Theme',
        description: 'Indigo Pulse Mobility - Perfect for night usage',
        file: 'dark-theme.css',
        icon: 'fas fa-sun',
        colors: {
            primary: '#5A31F4',
            secondary: '#1AD1FF', 
            accent: '#00F59C',
            warning: '#FF3EA5',
            background: '#0A0A12',
            surface: '#161632',
            text: '#F5F5F7'
        }
    },
    light: {
        name: 'Light Theme',
        description: 'Clean & Professional - Perfect for day usage',
        file: 'light-theme.css',
        icon: 'fas fa-moon',
        colors: {
            primary: '#5A31F4',
            secondary: '#2CE5FF',
            accent: '#20E3B2', 
            warning: '#FF4ECD',
            background: '#FFFFFF',
            surface: '#F8F9FA',
            text: '#1F2937'
        }
    }
};

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VELORA_THEMES;
}
