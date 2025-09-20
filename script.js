(function() {
    'use strict';
    
    class Terminal {
        constructor() {
            this.input = document.getElementById('terminal-input');
            this.output = document.getElementById('output');
            this.statusEl = document.getElementById('live-status');
            
            // Check if elements exist
            if (!this.input || !this.output) {
                console.error('Terminal elements not found');
                return;
            }
            
            this.commands = {
                help: this.showHelp.bind(this),
                confess: this.confessAndDisplay.bind(this), // changed
                feed: this.showFeed.bind(this),
                clear: this.clearTerminal.bind(this),
                about: this.showAbout.bind(this)
            };
            
            // Safe localStorage access
            try {
                this.confessions = JSON.parse(localStorage.getItem('pumpfessions') || '[]');
            } catch (e) {
                console.warn('Failed to load confessions from localStorage:', e);
                this.confessions = [];
            }
            
            this.remoteEnabled = false;
            this.displayedIds = new Set();
            this.API_BASE = ''; // same origin
            
            this.initEventListeners();
            this.initRemote();
        }

        initEventListeners() {
            if (!this.input) return;
            
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleCommand(this.input.value.trim());
                    this.input.value = '';
                }
            });

            // Keep input focused
            document.addEventListener('click', () => {
                if (this.input) this.input.focus();
            });
        }

        handleCommand(input) {
            this.addLine(`user@pumpfessions:~$ ${input}`);
            
            if (!input) return;
            
            const [command, ...args] = input.split(' ');
            const commandFunc = this.commands[command.toLowerCase()];
            
            if (commandFunc) {
                try {
                    commandFunc(args.join(' '));
                } catch (error) {
                    console.error('Command execution error:', error);
                    this.addLine('Command execution failed', 'error');
                }
            } else {
                this.addLine(`Command not found: ${command}`, 'error');
                this.addLine('Type "help" for available commands');
            }
        }

        addLine(text, className = '') {
            const line = document.createElement('div');
            line.className = `line ${className}`;
            line.textContent = text;
            this.output.appendChild(line);
            this.scrollToBottom();
        }

        scrollToBottom() {
            this.output.scrollTop = this.output.scrollHeight;
        }

        showHelp() {
            const helpText = [
                'Available commands:',
                '  confess <message> - Post an anonymous confession',
                '  feed             - View recent confessions',
                '  clear            - Clear the terminal',
                '  about            - About Pumpfessions',
                '  help             - Show this help message'
            ];
            helpText.forEach(line => this.addLine(line));
        }

        initRemote() {
            // Quick reachability check
            fetch('/api/confessions', { method: 'GET' })
                .then(r => {
                    if (!r.ok) throw new Error();
                    this.remoteEnabled = true;
                    this.updateStatus('live connected');
                    return r.json();
                })
                .then(list => {
                    list.forEach(c => this.cacheConfession(c, false));
                })
                .catch(() => {
                    this.updateStatus('offline (local only)');
                })
                .finally(() => {
                    if (this.remoteEnabled) this.subscribeStream();
                });
        }

        updateStatus(text) {
            if (this.statusEl) this.statusEl.textContent = `[${text}]`;
        }

        subscribeStream() {
            try {
                const es = new EventSource('/api/stream');
                es.onmessage = (evt) => {
                    if (!evt.data) return;
                    let payload;
                    try { payload = JSON.parse(evt.data); } catch { return; }
                    if (payload.type === 'init') {
                        payload.confessions.forEach(c => this.cacheConfession(c, false));
                        return;
                    }
                    this.cacheConfession(payload, true);
                };
                es.onerror = () => {
                    this.updateStatus('disconnected (retrying)');
                };
            } catch {
                this.updateStatus('stream unsupported');
            }
        }

        cacheConfession(confession, displayIfNew) {
            if (!confession || this.displayedIds.has(confession.id)) return;
            this.displayedIds.add(confession.id);
            this.confessions = this.confessions || [];
            this.confessions.unshift(confession);
            if (displayIfNew) this.renderConfession(confession);
        }

        renderConfession(confession) {
            const confessionDiv = document.createElement('div');
            confessionDiv.className = 'line confession';
            const meta = document.createElement('div');
            meta.className = 'confession-meta';
            meta.textContent = `[${confession.displayTime}] Anonymous Pumper`;
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `"${confession.message}"`;
            confessionDiv.appendChild(meta);
            confessionDiv.appendChild(messageDiv);
            this.output.appendChild(confessionDiv);
            this.scrollToBottom();
        }

        confessAndDisplay(message) {
            if (!message.trim()) {
                this.addLine('Usage: confess <your confession>', 'error');
                return;
            }
            if (this.remoteEnabled) {
                this.addLine('Submitting confession to network...');
                fetch('/api/confessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message.trim() })
                })
                .then(r => r.json())
                .then(confession => {
                    if (confession.error) throw new Error(confession.error);
                    this.cacheConfession(confession, true);
                    this.addLine('Confession published to live feed', 'success');
                })
                .catch(() => {
                    this.addLine('Remote failed, storing locally only', 'error');
                    this.confessLocal(message);
                });
            } else {
                this.confessLocal(message);
            }
        }

        confessLocal(message) {
            const confession = {
                id: Date.now().toString(),
                message: message.trim(),
                timestamp: new Date().toISOString(),
                displayTime: new Date().toLocaleString()
            };
            this.confessions.unshift(confession);
            try { localStorage.setItem('pumpfessions', JSON.stringify(this.confessions)); } catch {}
            this.renderConfession(confession);
            this.addLine('Confession stored locally (offline mode)', 'success');
        }

        showFeed() {
            if (this.remoteEnabled) {
                fetch('/api/confessions')
                    .then(r => r.json())
                    .then(list => {
                        this.addLine('=== Live Pumpfessions Feed ===');
                        list.slice(0, 10).forEach(c => {
                            this.cacheConfession(c, false);
                            this.renderConfession(c);
                        });
                    })
                    .catch(() => this.addLine('Failed to load live feed', 'error'));
                return;
            }
            if (this.confessions.length === 0) {
                this.addLine('No confessions found. Be the first to confess!');
                return;
            }
            this.addLine('=== Local Pumpfessions ===');
            this.confessions.slice(0, 10).forEach(c => this.renderConfession(c));
        }

        clearTerminal() {
            this.output.innerHTML = `
                <div class="line">Welcome to Pumpfessions - Anonymous Solana Confessions</div>
                <div class="line">Type 'help' for available commands</div>
            `;
        }

        showAbout() {
            const aboutText = [
                'Pumpfessions v1.0',
                'A terminal for anonymous Solana ecosystem confessions',
                '',
                'Confess your pump.fun crimes, rug pulls, and degen trades',
                'All confessions are stored locally and anonymously',
                '',
                'Built for the Solana community by degens, for degens'
            ];
            aboutText.forEach(line => this.addLine(line));
        }
    }

    // Initialize terminal when DOM is ready
    function initTerminal() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new Terminal();
            });
        } else {
            new Terminal();
        }
    }

    initTerminal();
})();
