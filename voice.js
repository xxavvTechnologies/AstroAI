class VoiceInteraction {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voiceIndicator = null;
        this.voicePreferences = JSON.parse(localStorage.getItem('voicePreferences')) || {
            rate: 1,
            pitch: 1,
            volume: 1,
            voice: null,
            autoResume: true
        };
        this.conversationMemory = [];
        this.hasUserInteracted = false;
        this.isConversational = false;
        this.useElevenLabs = true; // Enable ElevenLabs by default
        this.elevenLabsKey = 'sk_8cbaf23da787049fa1e1e8c0f81d43a83cfb9aa7ba947cf2';
        this.elevenLabsVoiceId = 'SAz9YHcvj6GT2YYXdXww';
        document.addEventListener('click', () => {
            this.hasUserInteracted = true;
        }, { once: true });
        this.setupRecognition();
        this.setupVoiceIndicator();
        this.setupVoicePreferences();
        this.setupVoiceSettings();
    }

    setupVoicePreferences() {
        // Load preferred voice
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            const voices = this.synthesis.getVoices();
            if (this.voicePreferences.voice) {
                const savedVoice = voices.find(v => v.name === this.voicePreferences.voice);
                if (savedVoice) this.voicePreferences.voiceObject = savedVoice;
            }
            // Select default voice if none is saved
            if (!this.voicePreferences.voiceObject) {
                this.selectDefaultVoice();
            }
        });
    }

    selectDefaultVoice() {
        const voices = this.synthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.includes('en-'));
        
        if (englishVoices.length > 0) {
            // Prioritize neural/premium voices
            this.voicePreferences.voiceObject = englishVoices.find(v => 
                v.name.toLowerCase().includes('neural') ||
                v.name.includes('Premium') ||
                v.name.includes('Google')
            ) || englishVoices[0];
            
            this.voicePreferences.voice = this.voicePreferences.voiceObject.name;
            localStorage.setItem('voicePreferences', JSON.stringify(this.voicePreferences));
        }
    }

    improveNaturalness(text) {
        // Add SSML-like improvements while keeping valid text
        return text
            .replace(/\b(\d+)\b/g, (_, num) => this.convertNumberToWords(num))
            .replace(/([.!?])\s+/g, '$1<break time="500ms"/>')
            .replace(/,\s+/g, ',<break time="200ms"/>')
            .replace(/([A-Z][a-z]+:)/g, '<emphasis>$1</emphasis>')
            .replace(/\b(however|moreover|furthermore)\b/gi, '<break time="300ms"/>$1');
    }

    convertNumberToWords(num) {
        const special = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return special[Number(num)] || num;
    }

    setupRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            window.notifications.error('Voice recognition not supported in this browser', 'VOICE001');
            return;
        }

        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceIndicator();
            window.notifications.info('Listening...', 'VOICE002');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceIndicator();
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;

            // Handle low confidence results
            if (confidence < 0.5) {
                window.notifications.warning('I may have misheard you. Please try again.', 'VOICE008');
            }

            document.getElementById('user-input').value = transcript;
            
            // Check for voice commands
            if (this.handleVoiceCommands(transcript)) {
                return;
            }

            document.getElementById('chat-form').dispatchEvent(new Event('submit'));
        };

        this.recognition.onerror = (event) => {
            window.notifications.error(`Voice recognition error: ${event.error}`, 'VOICE003');
            this.isListening = false;
            this.updateVoiceIndicator();
        };
    }

    handleVoiceCommands(transcript) {
        const commands = {
            'stop speaking': () => this.synthesis.cancel(),
            'speak (faster|slower)': (speed) => {
                this.voicePreferences.rate *= speed === 'faster' ? 1.1 : 0.9;
                localStorage.setItem('voicePreferences', JSON.stringify(this.voicePreferences));
                window.notifications.info(`Speaking ${speed}`, 'VOICE009');
            },
            'speak (louder|softer)': (volume) => {
                this.voicePreferences.volume *= volume === 'louder' ? 1.1 : 0.9;
                localStorage.setItem('voicePreferences', JSON.stringify(this.voicePreferences));
                window.notifications.info(`Volume ${volume}`, 'VOICE010');
            }
        };

        for (const [pattern, handler] of Object.entries(commands)) {
            const match = transcript.toLowerCase().match(new RegExp(`^${pattern}$`));
            if (match) {
                handler(match[1]);
                return true;
            }
        }
        return false;
    }

    setupVoiceIndicator() {
        // Create voice button in chat form
        const inputArea = document.querySelector('.input-wrapper');  // Changed from .input-area
        const voiceButton = document.createElement('button');
        voiceButton.type = 'button';
        voiceButton.className = 'tool-btn voice-btn';  // Added tool-btn class to match other buttons
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.title = 'Press to speak';
        
        // Insert into chat tools div instead
        const chatTools = document.querySelector('.chat-tools');
        chatTools.appendChild(voiceButton);

        this.voiceIndicator = voiceButton;
        voiceButton.addEventListener('click', () => this.toggleListening());

        // Update styles to match other tool buttons
        const style = document.createElement('style');
        style.textContent = `
            .voice-btn.listening {
                animation: pulseVoice 1.5s infinite;
                background: #ff4444 !important;  /* Override tool-btn background */
            }

            @keyframes pulseVoice {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    updateVoiceIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.classList.toggle('listening', this.isListening);
            this.voiceIndicator.innerHTML = this.isListening ? 
                '<i class="fas fa-stop"></i>' : 
                '<i class="fas fa-microphone"></i>';
        }
    }

    toggleListening() {
        if (!this.recognition) {
            window.notifications.error('Voice recognition not supported', 'VOICE004');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async speak(text, force = false) {
        // Skip conversational check if force is true
        if (!force && !this.isConversational) return;

        if (this.useElevenLabs && this.elevenLabsKey) {
            try {
                await this.speakWithElevenLabs(text);
                return;
            } catch (error) {
                console.error('ElevenLabs error:', error);
                window.notifications.warning('Falling back to browser speech', 'VOICE013');
                // Fall back to browser speech synthesis
                this.speakWithBrowser(text);
            }
        } else {
            this.speakWithBrowser(text);
        }
    }

    async speakWithElevenLabs(text) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.75,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onplay = () => {
                window.notifications.info('Speaking with ElevenLabs...', 'VOICE014');
                this.updateVoiceIndicator();
            };

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.updateVoiceIndicator();
                if (this.voicePreferences.autoResume && this.recognition) {
                    setTimeout(() => this.recognition.start(), 500);
                }
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                throw new Error('Audio playback error');
            };

            await audio.play();

        } catch (error) {
            console.error('ElevenLabs playback error:', error);
            throw error;
        }
    }

    speakWithBrowser(text) {
        if (!this.synthesis) {
            window.notifications.error('Speech synthesis not supported', 'VOICE005');
            return;
        }

        // Check if speech synthesis is allowed
        if (!this.hasUserInteracted) {
            window.notifications.warning(
                'Click anywhere on the page first to enable voice features',
                'VOICE007'
            );
            
            // Set up one-time click handler
            const enableVoice = () => {
                this.hasUserInteracted = true;
                document.removeEventListener('click', enableVoice);
                this.speakWithBrowser(text);
            };
            document.addEventListener('click', enableVoice);
            return;
        }

        try {
            this.synthesis.cancel();

            // Process text for more natural speech
            const processedText = this.improveNaturalness(text);
            const utterance = new SpeechSynthesisUtterance(processedText);
            
            // Set basic preferences first
            utterance.rate = this.voicePreferences.rate;
            utterance.pitch = this.voicePreferences.pitch;
            utterance.volume = this.voicePreferences.volume;
            
            // Handle voice assignment safely
            if (this.voicePreferences.voiceObject) {
                utterance.voice = this.voicePreferences.voiceObject;
            } else {
                this.selectDefaultVoice();
                if (this.voicePreferences.voiceObject) {
                    utterance.voice = this.voicePreferences.voiceObject;
                }
            }

            // Add expression and dynamic features
            this.addExpressionToSpeech(utterance, text);

            // Handle speech events with better error handling
            utterance.onstart = () => {
                window.notifications.info('Speaking...', 'VOICE006');
                this.updateVoiceIndicator();
            };

            utterance.onend = () => {
                if (this.voicePreferences.autoResume && this.recognition) {
                    setTimeout(() => this.recognition.start(), 500);
                }
                this.updateVoiceIndicator();
            };

            utterance.onerror = (event) => {
                const errorMap = {
                    'not-allowed': 'Voice permission denied. Click anywhere to enable.',
                    'network': 'Network error occurred while loading voice.',
                    'interrupted': 'Speech was interrupted.',
                    'canceled': 'Speech was canceled.',
                };
                
                const errorMessage = errorMap[event.error] || `Speech synthesis error: ${event.error}`;
                window.notifications.error(errorMessage, 'VOICE007');
                this.updateVoiceIndicator();
            };

            this.synthesis.speak(utterance);
            
        } catch (error) {
            console.error('Speech synthesis error:', error);
            window.notifications.error('Failed to start speech', 'VOICE008');
            this.updateVoiceIndicator();
        }
    }

    addExpressionToSpeech(utterance, text) {
        // Adjust rate based on punctuation and content
        if (text.includes('!')) utterance.rate *= 1.1;
        if (text.includes('?')) utterance.pitch *= 1.1;
        
        // Slow down for important information
        if (text.match(/important|warning|caution|notice/i)) {
            utterance.rate *= 0.9;
        }

        // Add prosody for emotional content
        if (text.match(/great|excellent|amazing/i)) {
            utterance.pitch *= 1.1;
        } else if (text.match(/sorry|unfortunately|error/i)) {
            utterance.pitch *= 0.9;
        }

        // Store in conversation memory
        this.conversationMemory.push({
            text,
            timestamp: Date.now()
        });

        // Limit memory size
        if (this.conversationMemory.length > 10) {
            this.conversationMemory.shift();
        }
    }

    setupVoiceSettings() {
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            // Add ElevenLabs toggle
            const elevenLabsToggle = document.createElement('label');
            elevenLabsToggle.className = 'search-toggle';
            elevenLabsToggle.innerHTML = `
                <input type="checkbox" id="enable-elevenlabs" ${this.useElevenLabs ? 'checked' : ''}>
                <span class="toggle-label">🎭 ElevenLabs</span>
            `;
            chatTools.appendChild(elevenLabsToggle);

            // Add voice mode toggle
            const voiceToggle = document.createElement('label');
            voiceToggle.className = 'search-toggle';
            voiceToggle.innerHTML = `
                <input type="checkbox" id="enable-voice">
                <span class="toggle-label">🗣️ Voice Mode</span>
            `;
            chatTools.appendChild(voiceToggle);

            // Setup event listeners
            elevenLabsToggle.querySelector('input').addEventListener('change', (e) => {
                this.useElevenLabs = e.target.checked;
                window.notifications.info(
                    `Using ${this.useElevenLabs ? 'ElevenLabs' : 'browser'} voice`,
                    'VOICE015'
                );
            });

            voiceToggle.querySelector('input').addEventListener('change', (e) => {
                this.isConversational = e.target.checked;
                if (e.target.checked) {
                    window.notifications.info('Voice mode enabled', 'VOICE011');
                } else {
                    this.synthesis.cancel();
                    window.notifications.info('Voice mode disabled', 'VOICE012');
                }
            });
        }
    }
}

// Create and export a singleton instance
export const voiceInteraction = new VoiceInteraction();

// Setup auto-response speech
document.addEventListener('DOMContentLoaded', () => {
    // Ensure voices are loaded before setting up observer
    window.speechSynthesis.getVoices();
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList?.contains('bot-message') && voiceInteraction.isConversational) {
                    // Add small delay to ensure content is fully rendered
                    setTimeout(() => {
                        voiceInteraction.speak(node.textContent);
                    }, 100);
                }
            });
        });
    });

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        observer.observe(chatMessages, {
            childList: true
        });
    }
});

// Make voiceInteraction instance available globally
window.voiceInteraction = voiceInteraction;
