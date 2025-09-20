(function() {
    'use strict';

    class Terminal {
        constructor() {
            this.input = document.getElementById('terminal-input');
            this.output = document.getElementById('output');
            this.userId = this.generateUserId(); // Generate a unique user ID

            if (!this.input || !this.output) {
                console.error('Terminal elements not found');
                return;
            }

            // Update the prompt display with the generated user ID
            const promptElements = document.querySelectorAll('.prompt');
            promptElements.forEach(prompt => {
                prompt.textContent = `${this.userId}:~$ `;
            });

            // Commands
            this.commands = {
                help: this.showHelp.bind(this),
                confess: this.confessAndDisplay.bind(this),
                feed: this.showFeed.bind(this),
                clear: this.clearTerminal.bind(this),
                about: this.showAbout.bind(this)
            };

            // Remote functionality flag
            this.remoteEnabled = false;

            // Local confessions only
            try {
                this.confessions = JSON.parse(localStorage.getItem('pumpfessions') || '[]');
            } catch (error) {
                console.error('Failed to parse confessions from localStorage:', error);
                this.confessions = [];
            }

            // Load preloaded confessions from the embedded array
            this.preloadedConfessions = this.loadPreloadedConfessions();
            
            // Track which confessions have been displayed
            this.displayedConfessions = new Set();
            
            // Avoid magic numbers - define them as constants
            this.CONFESSION_FEED_STARTUP_DELAY = 5000;
            
            this.initEventListeners();
            this.clearTerminal(); // Show welcome message
            setTimeout(() => this.startConfessionFeed(), this.CONFESSION_FEED_STARTUP_DELAY); // Start confession feed after 5 seconds
        }

        // Load preloaded confessions from the pumpfessions.md content
        loadPreloadedConfessions() {
            // Array of preloaded confessions extracted from pumpfessions.md
            return [
                "Sold my wife's wedding ring for TROLL. She found out when I couldn't afford this month's rent. Moving out tomorrow.",
                "$500 → $12k → $89 → food stamps. Thanks Cupsey.",
                "Day 47: Still can't tell my parents I lost their retirement fund on Unstable coin. Dad keeps asking about the \"crypto gains.\"",
                "Watched BAGWORK pump 400% while my sell order sat 0.01% too high. Pain.",
                "/status update: living in car. portfolio up 140%. worth it. $RETIRE to the moon.",
                "Just took out a 28k personal loan to average down on CHILLHOUSE. This can't go tits up right?",
                "gm. lost house. marriage in shambles. fartcoin still funny tho.",
                "Someone please tell my boss I'm not actually in the bathroom, just watching Pump Fun charts for 45 mins.",
                "note to self: stop buying TROLL at ATH (attempt #7)",
                "Remember when I posted that 50x on Cupsey? Yeah just lost 98% trying to repeat it.",
                "My wife left after I put our house deposit into TROLL. She said \"it's me or crypto.\" I chose wrong.",
                "Started with $500 in Cupsey, turned it into $12k, then $0. My dad still thinks I'm saving for college.",
                "Lost $43k of student loans on Unstable coin. The irony isn't lost on me.",
                "Put my entire first paycheck into Pump Fun. Living in my car but still watching charts.",
                "Borrowed $5k from my brother for BAGWORK. Now I'm dodging his calls and working double shifts.",
                "CHILLHOUSE sounded like a vibe. Now it's just where my money went to chill permanently.",
                "Cupsey was my moonshot. Now I'm grounded, eating ramen.",
                "Pump Fun is my daily reminder that greed is not a strategy.",
                "TROLL coin trolled me harder than my ex ever did.",
                "Unstable coin: the only thing more volatile than my emotions.",
                "Fartcoin made me laugh until I realized I was down 90%.",
                "Sold my gaming PC to buy StreamerCoin. Now I'm watching charts on my phone at McDonald's WiFi.",
                "$Runner pumped while I was actually running. Cardio has never hurt so bad.",
                "Lost 80% on Kindness coin. The irony of being unkind to my savings isn't lost on me.",
                "Wife found my Tokabu losses in our joint account. Now I'm single and still holding.",
                "ASSDAQ went up 600% during my job interview. Couldn't focus, now I'm jobless and rugpulled.",
                "Trencher Broadcasting Company took my rent money. Living with parents, they think I'm \"between apartments.\"",
                "All in on StreamerCoin. Streaming my portfolio going to zero on Pump Fun for content.",
                "Took a loan to buy $Runner at ATH. Now I can't afford a real treadmill.",
                "\"Kindness coin will change the world,\" I said, before it changed my bank balance to zero.",
                "Tokabu looked cute until it ate my life savings.",
                "ASSDAQ seemed like a funny bet until my wife saw our bank statement.",
                "Lost my college fund on Trencher. Dad thinks I'm still in school. I'm living in my car.",
                "Watched StreamerCoin dump while literally streaming. Chat loved it.",
                "$Runner made me rich for 3 hours. Back to food stamps by dinner.",
                "Put my wedding savings into Kindness coin. Fiancée left. At least I'm holding.",
                "Liquidated my 401k for Tokabu. HR keeps asking why I stopped contributions.",
                "ASSDAQ looked like free money until I lost my house down payment.",
                "Trencher Broadcasting Company: from six figures to six packs of ramen.",
                "Tried to daytrade StreamerCoin. Now streaming from public library WiFi.",
                "Mortgage approval came through same day as TROLL listing. Guess who's still renting?",
                "Went all in on BAGWORK. Boss asked why I was crying in the company bathroom. Told him allergies.",
                "Convinced grandma crypto was the future. Put her inheritance in Unstable coin. Now she's working at 78.",
                "My therapist says I have \"unhealthy attachment issues.\" She doesn't understand my CHILLHOUSE bags.",
                "Told my date I'm \"in finance.\" Truth is I'm down 94% on fartcoin and eat sleep for dinner.",
                "Neighbors think I'm a successful trader. They don't see me selling plasma to buy TROLL dips.",
                "Put my engagement ring fund into Cupsey. Now I propose with NFT screenshots. She said no.",
                "$RETIRE was supposed to be my escape plan. Now retirement means dying at my desk.",
                "Got fired for trading BAGWORK during quarterly presentation. Worth it until the rug.",
                "Tax guy asked about my crypto. I laughed until I cried. He didn't get the joke.",
                "Kids wanted Disney vacation. I promised \"to the moon\" with Unstable coin. We're watching Disney+ in the garage now.",
                "Trading CHILLHOUSE instead of working. 3 promotions missed, still convinced next pump will fix everything.",
                "Quit my job after 400% gain on Cupsey. Two days later: -98%. LinkedIn profile now \"Entrepreneur.\"",
                "Parents think I have gambling addiction. It's actually worse - I'm bullish on fartcoin.",
                "Divorce settlement: ex-wife got house, I kept my TROLL bags. Currently sleeping at bus station with diamond hands.",
                "Sold car to buy BAGWORK dip. Uber driver tired of picking me up at Wendy's after night shift.",
                "Missed own wedding rehearsal watching $RETIRE chart. Fiancée still doesn't know why I was \"in traffic.\"",
                "Friend lent me 10k for emergency. Emergency was Unstable coin listing. We're not friends anymore.",
                "CHILLHOUSE was supposed to pay for my surgery. Hospital doesn't accept unrealized gains as payment.",
                "Streaming on Pump Fun 18 hours a day from my mom's basement. She thinks I'm job hunting.",
                "Sold family heirloom for Cupsey. Grandpa's ghost watching me eat ramen in the dark.",
                "Maxed out credit cards on fartcoin. Financial advisor blocked my number.",
                "Told wife I'm working late. Actually crying at McDonald's watching TROLL chart on free wifi.",
                "College fund → BAGWORK → empty wallet. Son starts community college next week.",
                "Remortgaged house for $RETIRE without telling spouse. Paper gains screenshot saved as \"proof\" for when they find out.",
                "Hit 300k with TROLL, refused to sell, now back to my starting 2k. Roommate still thinks I'm a \"crypto genius.\"",
                "Paid for my sister's wedding with Unstable coin gains. Didn't tell anyone when it crashed. Now selling blood to cover the venue.",
                "Spent 8 months convincing coworkers to join my \"investment group.\" We're all in CHILLHOUSE. HR wants to talk Monday.",
                "Wrote \"crypto expert\" on my resume after turning $50 into $10k on Pump Fun. Lost it all during the interview when checking charts.",
                "fartcoin 10x'd while I was asleep. Woke up, went all in, now down 99%. Alarm clock for sale.",
                "Borrowed against my house for Cupsey presale. Wife thinks renovations start next week. Need a convincing excuse and a divorce lawyer.",
                "Streamed 72 hours straight on Pump Fun to afford rent. Made $18.50. Landlord not impressed with my \"growing audience.\"",
                "Accidentally sent 50k TROLL to wrong address. Person who received it sent 100k back. Faith in humanity restored, still can't afford dinner.",
                "BAGWORK dumped right after I told my boss to shove it. Turns out \"financial freedom\" lasts exactly 37 minutes.",
                "$5k → $120k → $800 on Unstable coin in 72 hours. At least the chart looks like a cool rollercoaster.",
                "Bought CHILLHOUSE instead of paying taxes. IRS doesn't accept \"but ser, tokenomics\" as an explanation.",
                "Called in sick for a week to day trade Cupsey. Boss followed me on Pump Fun. Awkward meeting tomorrow.",
                "$RETIRE pumped 1000% right after I panic sold. Calculated that I missed out on $387k. Therapist says to stop doing that calculation.",
                "Got scammed buying \"rare\" TROLL NFT for 15 SOL. Found out it was AI generated. Still telling everyone I'm \"building my portfolio.\"",
                "Spent 3 months learning technical analysis for fartcoin. Conclusion: lines go right, money goes down.",
                "When BAGWORK pumped, I upgraded my ramen to include an egg. When it dumped, I started looking at pictures of eggs online.",
                "In-laws think I'm investing their money in \"stable assets.\" If Unstable coin doesn't recover, Christmas dinner will be interesting.",
                "Turned $300 into $45k with CHILLHOUSE, then $45k into $450. Tax accountant said I've created a \"fascinating case study.\"",
                "Explaining to my 5-year-old why we can't go to Disney: \"Daddy's money is sleeping in the blockchain.\"",
                "Dumped my boyfriend because he wouldn't buy TROLL. He bought $RETIRE instead and now drives a Lambo. I'm still on the bus.",
                "Liquidated my daughter's college fund for Cupsey's \"guaranteed 10x.\" Now researching \"how to tell your child they can't go to college.\"",
                "Blew my inheritance on fartcoin because \"funny name = easy gains.\" Grandma watching from heaven, probably not laughing.",
                "Convinced my study group to pool money for Unstable coin. Now studying \"how to change identity\" instead of economics.",
                "Watched TROLL pump 40x on a stream, froze up, didn't sell. Stream ended, so did my dreams of financial freedom.",
                "My dating profile says \"crypto investor.\" Reality: lost 95% on BAGWORK and eat microwave burritos for every meal.",
                "Told my boss I'm quitting next week after CHILLHOUSE pumped. Now working overtime to afford ramen after the dump.",
                "Spent 6 months coding a \"perfect\" trading bot for Pump Fun. First day live: -74%. Could've just set money on fire.",
                "$RETIRE made me six figures for exactly 8 hours. Didn't sell because \"moon soon.\" Now back at Walmart with diamond hands.",
                "Wife's boyfriend gave me $5k to \"invest wisely.\" Put it all in Cupsey. Down 99.8%. He's moving my stuff to the garage tomorrow.",
                "gm. gained 200k. gn. lost 400k. fml.",
                "StreamerCoin pumped while I was live. Chat spammed \"SELL!\" but I said \"we're early.\" Stream title today: \"How I lost everything.\"",
                "Loaned money from a guy who definitely knows people who break legs. Used it to ape into Kindness coin. How ironic.",
                "Told mom I'd help with her medical bills after my \"investments\" mooned. TROLL dumped 80%. She's working double shifts at 64.",
                "Spent daughter's birthday money on Tokabu. Her party is now \"camping in the living room\" because it's \"adventure time.\"",
                "ASSDAQ paid for a week of luxury. Now showering at the gym and pretending it's for \"fitness reasons.\"",
                "Doctors found elevated blood pressure. Asked what's causing stress. Didn't tell them about $RETIRE position that's down 93%.",
                "Bought Unstable coin instead of fixing car. Walking 7 miles to work in rain while watching chart bleed on my cracked phone.",
                "FriendsDAO pooled 50k for Trencher. Now we're the \"FormerFriendsDAO\" and no one makes eye contact at the bar.",
                "Mortgaged house for CHILLHOUSE ICO. Wife was thrilled when it 10x'd. Less thrilled when I held to zero. Court date next month.",
                "Skipped sister's wedding for Cupsey token launch. Family still asking why. Can't admit I chose magic internet money over family.",
                "Told team I'm \"strategizing\" during meetings. Actually watching Pump Fun charts and silently having panic attacks.",
                "In-laws gave us house down payment. I gave it to fartcoin. Now living with in-laws who keep asking \"how's the house hunting going?\"",
                "Taking out payday loans to DCA into BAGWORK. Interest rate: 400% APR. BAGWORK performance: -80% YTD. Math is not mathing.",
                "Wife found Pump Fun on my screen, thought I was gambling. Explained it was \"sophisticated investing.\" Both of us were wrong.",
                "Relationship status: broke up because I called out TROLL price action during intimate moments. No regrets, charts are life.",
                "Used kid's tooth fairy money to buy $Runner dip. Tooth Fairy will need a loan next week. Child will need therapy forever."
            ];
        }

        // Fixed: Simplified generateUserId function to avoid stack overflow
        generateUserId() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const ID_LENGTH = 16;
            let userId = '';
            
            // Use a simple for loop to generate random ID
            for (let i = 0; i < ID_LENGTH; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                userId += chars.charAt(randomIndex);
            }
            
            return `user@${userId}`;
        }

        initEventListeners() {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const value = this.input.value.trim();
                    this.handleCommand(value);
                    this.input.value = '';
                }
            });
            document.addEventListener('click', () => this.input.focus());
        }

        handleCommand(input) {
            const commandLine = this.addLine(`${this.userId}:~$ ${input}`, 'command');
            if (!input) return;

            const [command, ...args] = input.split(' ');
            const fn = this.commands[command.toLowerCase()];

            if (fn) {
                // Change the command color to yellow for recognized commands
                commandLine.classList.add('command-recognized');
                try {
                    fn(args.join(' '));
                } catch (err) {
                    console.error(err);
                    this.addLine('Command execution failed', 'error');
                }
            } else {
                this.addLine(`Command not found: ${command}`, 'error');
                this.addLine('Type "help" for available commands', 'output-line');
            }
        }

        addLine(text, className = 'output-line') {
            const line = document.createElement('div');
            line.className = `line ${className}`;
            line.textContent = text;
            this.output.appendChild(line);
            this.scrollToBottom();
            return line; // Return the created line element for further manipulation
        }

        scrollToBottom() {
            this.output.scrollTop = this.output.scrollHeight;
        }

        showHelp() {
            [
                'Available commands:',
                '  confess <message> - Post an anonymous confession',
                '  feed             - View recent confessions',
                '  clear            - Clear the terminal',
                '  about            - About Pumpfessions',
                '  help             - Show this help message'
            ].forEach(l => this.addLine(l, 'output-line'));
        }

        renderConfession(confession) {
            // Accept either a raw string or a confession object
            const message = typeof confession === 'string' ? confession : confession.message;
            const userId = (confession && confession.userId) ? confession.userId : this.userId;
            const timestamp = (confession && (confession.displayTime || confession.timestamp)) 
                ? (confession.displayTime || new Date(confession.timestamp).toLocaleString())
                : new Date().toLocaleString();

            const confessionDiv = document.createElement('div');
            confessionDiv.className = 'line confession';

            const meta = document.createElement('div');
            meta.className = 'confession-meta';
            meta.textContent = `[${timestamp}] ${userId}`;

            const messageDiv = document.createElement('div');
            messageDiv.textContent = `"${message}"`;

            confessionDiv.appendChild(meta);
            confessionDiv.appendChild(messageDiv);
            this.output.appendChild(confessionDiv);
            this.scrollToBottom();
        }

        cacheConfession(confession, addToFront = true) {
            // Avoid duplicating confessions in cache
            const exists = this.confessions.some(c => c.id === confession.id);
            if (!exists) {
                if (addToFront) {
                    this.confessions.unshift(confession);
                } else {
                    this.confessions.push(confession);
                }
                // Keep cache at a reasonable size
                if (this.confessions.length > 50) {
                    this.confessions.length = 50;
                }
                try {
                    localStorage.setItem('pumpfessions', JSON.stringify(this.confessions));
                } catch (e) {
                    console.error('Failed to save to localStorage:', e);
                }
            }
        }

        confessAndDisplay(message) {
            if (!message.trim()) {
                this.addLine('Usage: confess <your confession>', 'error');
                return;
            }
            
            // Sanitize the input to prevent XSS
            const sanitizedMessage = this.sanitizeInput(message.trim());
            const confession = {
                id: Date.now().toString(),
                message: sanitizedMessage,
                timestamp: new Date().toISOString(),
                displayTime: new Date().toLocaleString(),
                userId: this.userId
            };
            
            this.confessions.unshift(confession);
            try { 
                localStorage.setItem('pumpfessions', JSON.stringify(this.confessions)); 
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
            }
            
            this.renderConfession(confession);
            this.addLine('Confession stored locally (offline mode)', 'success');
        }
        
        // Add a sanitization method
        sanitizeInput(input) {
            return input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        showFeed() {
            if (this.confessions.length === 0) {
                this.addLine('No confessions found. Be the first to confess!', 'output-line');
                return;
            }
            
            this.addLine('=== Local Pumpfessions ===', 'output-line');
            this.confessions.slice(0, 10).forEach(c => this.renderConfession(c));
        }

        clearTerminal() {
            this.output.innerHTML = `
                <div class="line output-line">Welcome to Pumpfessions - Anonymous pump.fun Confessions</div>
                <div class="line output-line">Type 'help' for available commands</div>
            `;
        }

        showAbout() {
            const aboutText = [
                'Pumpfessions v1.1.0',
                'A terminal for anonymous pump.fun confessions',
                '',
                'Confess your pump.fun crimes, rug pulls, and degen trades',
                'All confessions are stored locally and anonymously',
                '',
                'Built for the pump.fun community by degens, for degens'
            ];
            aboutText.forEach(line => this.addLine(line, 'output-line'));
        }

        startConfessionFeed() {
            // Define constants at the top for better readability
            const MIN_INTERVAL = 15000;
            const MAX_INTERVAL = 45000;
            const LOADING_DELAY = 2000;
            
            const getRandomInterval = () => {
                const skewed = Math.pow(Math.random(), 2);
                return Math.floor(MIN_INTERVAL + (MAX_INTERVAL - MIN_INTERVAL) * skewed);
            };

            const generateRandomUserId = () => {
                const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                let userId = '';
                for (let i = 0; i < 16; i++) {
                    userId += chars[Math.floor(Math.random() * chars.length)];
                }
                return `user@${userId}`;
            };

            // Check if preloaded confessions exist and have content
            if (!Array.isArray(this.preloadedConfessions) || this.preloadedConfessions.length === 0) {
                console.warn('Auto-feed disabled: No preloaded confessions available');
                this.addLine('Auto-feed disabled (no preloaded confessions configured).', 'output-line');
                return;
            }

            // Use requestAnimationFrame to prevent flooding the event queue
            const scheduleNextConfession = (delay) => {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        displayRandomConfession();
                    });
                }, delay);
            };

            const displayRandomConfession = () => {
                this.addLine('Loading latest user submission...', 'output-line');
                
                setTimeout(() => {
                    // Check if all confessions have been displayed
                    if (this.displayedConfessions.size >= this.preloadedConfessions.length) {
                        // Just end the function without a message - the loading message will remain
                        scheduleNextConfession(getRandomInterval()); // Keep the feed going
                        return;
                    }
                    
                    // Find a confession that hasn't been displayed yet
                    let availableConfessions = this.preloadedConfessions.filter(
                        (_, index) => !this.displayedConfessions.has(index)
                    );
                    
                    if (availableConfessions.length === 0) {
                        // Just end the function without a message - the loading message will remain
                        scheduleNextConfession(getRandomInterval()); // Keep the feed going
                        return;
                    }
                    
                    // Select a random confession from available ones
                    const randomIndex = Math.floor(Math.random() * availableConfessions.length);
                    const originalIndex = this.preloadedConfessions.indexOf(availableConfessions[randomIndex]);
                    const confession = availableConfessions[randomIndex];
                    
                    // Mark this confession as displayed
                    this.displayedConfessions.add(originalIndex);
                    
                    // Create a confession object for display
                    const confessionObj = {
                        message: confession,
                        userId: generateRandomUserId(),
                        displayTime: new Date().toLocaleString()
                    };
                    
                    // Use the existing renderConfession method
                    this.renderConfession(confessionObj);
                    
                    // Schedule the next confession (always schedule, even if we're out of confessions)
                    const nextInterval = getRandomInterval();
                    scheduleNextConfession(nextInterval);
                    
                }, LOADING_DELAY);
            };

            displayRandomConfession();
        }
    }

    // Initialize terminal when DOM is ready - Fixed the duplicate initialization
    function initTerminal() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => new Terminal());
        } else {
            new Terminal();
        }
    }

    // Call initTerminal only once
    initTerminal();
})();
