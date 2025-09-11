// Velora Chatbot powered by Gemini AI

class VeloraChatbot {
    constructor() {
        this.apiKey = '';
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.container = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.sendButton = null;
        this.toggleButton = null;
        
        this.init();
    }
    
    async init() {
        // Use the API key directly for now
        this.apiKey = 'AIzaSyCj5f-QLXDbvB9OXuxTyrM1A5jgpQGZfkA';
        console.log('Using Gemini API key');
        
        this.createChatbotUI();
        this.attachEventListeners();
        
        // Add welcome message
        this.addBotMessage('Hello! I\'m your Velora assistant. How can I help you with campus transportation today?');
    }
    
    createChatbotUI() {
        // Create toggle button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'chatbot-toggle';
        this.toggleButton.innerHTML = '<i class="fas fa-comment"></i>';
        document.body.appendChild(this.toggleButton);
        
        // Create chatbot container
        this.container = document.createElement('div');
        this.container.className = 'chatbot-container';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <h3>Velora Assistant</h3>
            <button class="chatbot-close"><i class="fas fa-times"></i></button>
        `;
        
        // Create messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chatbot-messages';
        
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'chatbot-input';
        
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.placeholder = 'Type your message...';
        
        this.sendButton = document.createElement('button');
        this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        this.sendButton.disabled = true;
        
        inputArea.appendChild(this.inputField);
        inputArea.appendChild(this.sendButton);
        
        // Assemble the chatbot
        this.container.appendChild(header);
        this.container.appendChild(this.messagesContainer);
        this.container.appendChild(inputArea);
        
        document.body.appendChild(this.container);
    }
    
    attachEventListeners() {
        // Toggle chatbot visibility
        this.toggleButton.addEventListener('click', () => this.toggleChatbot());
        
        // Close button
        const closeButton = this.container.querySelector('.chatbot-close');
        closeButton.addEventListener('click', () => this.toggleChatbot(false));
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Enable/disable send button based on input
        this.inputField.addEventListener('input', () => {
            this.sendButton.disabled = this.inputField.value.trim() === '';
        });
    }
    
    toggleChatbot(forceState = null) {
        this.isOpen = forceState !== null ? forceState : !this.isOpen;
        
        if (this.isOpen) {
            this.container.classList.add('active');
            this.inputField.focus();
        } else {
            this.container.classList.remove('active');
        }
    }
    
    addUserMessage(text) {
        const message = document.createElement('div');
        message.className = 'message user';
        message.textContent = text;
        this.messagesContainer.appendChild(message);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ role: 'user', content: text });
    }
    
    addBotMessage(text) {
        const message = document.createElement('div');
        message.className = 'message bot';
        message.textContent = text;
        this.messagesContainer.appendChild(message);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ role: 'bot', content: text });
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = this.messagesContainer.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    async sendMessage() {
        const userMessage = this.inputField.value.trim();
        if (userMessage === '') return;
        
        // Clear input field
        this.inputField.value = '';
        this.sendButton.disabled = true;
        
        // Add user message to chat
        this.addUserMessage(userMessage);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get response from Gemini API
            const response = await this.getGeminiResponse(userMessage);
            
            // Hide typing indicator and add bot response
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            console.error('Error getting response from Gemini:', error);
            
            // Hide typing indicator and show error message
            this.hideTypingIndicator();
            this.addBotMessage('Sorry, I encountered an error. Please try again later.');
        }
    }
    
    async getGeminiResponse(userMessage) {
        // If no API key, return a fallback message
        if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
            return "I'm sorry, but I can only answer questions related to Velora transportation services.";
        }
        
        try {
            // Format the conversation history for the API
            const history = this.messages.map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            
            // Add the new user message
            const prompt = {
                role: 'user',
                parts: [{ text: userMessage }]
            };
            
            // Check if the message is asking about what Velora is
            if (userMessage.toLowerCase().includes('what is velora') || 
                userMessage.toLowerCase().includes('what\'s velora') ||
                userMessage.toLowerCase() === 'velora') {
                return "Velora is a campus transportation service that connects students with drivers for safe and affordable rides around campus and nearby areas. You can book rides, track your driver, make payments, and rate your experience all through our app.";
            }
            
            // Check if the message is a greeting
            const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
            if (greetings.some(greeting => userMessage.toLowerCase() === greeting || 
                              userMessage.toLowerCase().startsWith(greeting + ' '))) {
                return "Hello! I'm your Velora assistant. I can help you with booking rides, checking fares, tracking your driver, and answering questions about our campus transportation service. What would you like to know?";
            }
            
            // Check if the message is related to transportation or the Velora app
            const transportationKeywords = ['ride', 'transport', 'car', 'auto', 'driver', 'trip', 'travel', 'book', 'fare', 
                                          'pickup', 'destination', 'route', 'campus', 'student', 'velora', 'payment', 
                                          'wallet', 'safety', 'tracking', 'location', 'time', 'schedule', 'rating'];
            
            const isTransportationRelated = transportationKeywords.some(keyword => 
                userMessage.toLowerCase().includes(keyword.toLowerCase()));
            
            if (!isTransportationRelated) {
                return "I'm sorry, I can only answer questions related to Velora transportation services. Please ask me about rides, bookings, fares, or other transportation features.";
            }
            
            // Call the Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [...history, prompt],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    }
                })
            });
            
            const data = await response.json();
            
            // Extract the response text
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
}

// Initialize the chatbot when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load the chatbot CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/chatbot.css';
    document.head.appendChild(link);
    
    // Initialize the chatbot
    window.veloraChatbot = new VeloraChatbot();
});