// State Management
        const state = {
            currentActivity: null,
            startTime: null,
            pausedTime: 0,
            isPaused: false,
            isRunning: false,
            timerInterval: null,
            totalPausedDuration: 0,
            lastPauseTime: null
        };

        const activities = {
            familia: { name: 'FAMÍLIA', color: 'blue', icon: 'fa-home' },
            parceiro: { name: 'PARCEIRO', color: 'amber', icon: 'fa-heart' },
            filhos: { name: 'FILHOS', color: 'orange', icon: 'fa-child' },
            amigos: { name: 'AMIGOS', color: 'teal', icon: 'fa-users' },
            trabalho: { name: 'TRABALHO', color: 'red', icon: 'fa-briefcase' },
            sozinho: { name: 'SOZINHO', color: 'green', icon: 'fa-user' }
        };

        // Modal Functions
        function openActivityModal() {
            document.getElementById('activityModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeActivityModal() {
            document.getElementById('activityModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function selectActivity(category) {
            closeActivityModal();
            startActivity(category);
        }

        // Core Timer Functions
        function startActivity(category) {
            // Stop any existing activity first
            if (state.isRunning) {
                stopActivity();
            }

            state.currentActivity = category;
            state.startTime = Date.now();
            state.pausedTime = 0;
            state.totalPausedDuration = 0;
            state.isPaused = false;
            state.isRunning = true;

            // Update UI
            updateStatus('active', activities[category].name);
            document.getElementById('currentActivityName').textContent = activities[category].name;
            document.getElementById('focusActivityName').textContent = activities[category].name;
            
            // Highlight category card
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.querySelector(`[data-category="${category}"]`)?.classList.add('active');

            // Show/Hide controls
            showControls('running');

            // Start timer
            state.timerInterval = setInterval(updateTimer, 1000);
            updateTimer();
        }

        function quickStart() {
            startActivity('trabalho');
        }

        function togglePause() {
            if (!state.isRunning) return;

            if (state.isPaused) {
                // Resume
                const now = Date.now();
                const pauseDuration = now - state.lastPauseTime;
                state.totalPausedDuration += pauseDuration;
                state.isPaused = false;
                state.lastPauseTime = null;
                
                updateStatus('active', activities[state.currentActivity].name);
                showControls('running');
                
                // Remove paused styling
                document.getElementById('mainTimer').classList.remove('paused');
                document.getElementById('timerCircle').classList.remove('paused');
                document.getElementById('focusTimerDisplay').classList.remove('paused');
                
            } else {
                // Pause
                state.isPaused = true;
                state.lastPauseTime = Date.now();
                
                updateStatus('paused', 'PAUSADO');
                showControls('paused');
                
                // Add paused styling
                document.getElementById('mainTimer').classList.add('paused');
                document.getElementById('timerCircle').classList.add('paused');
                document.getElementById('focusTimerDisplay').classList.add('paused');
            }
        }

        function stopActivity() {
            if (!state.isRunning) return;

            clearInterval(state.timerInterval);
            
            // Calculate final duration
            const now = Date.now();
            const totalElapsed = now - state.startTime - state.totalPausedDuration;
            const seconds = Math.floor(totalElapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            
            // Add to timeline if meaningful
            if (minutes > 0) {
                addToTimeline(state.currentActivity, minutes);
            }

            // Reset state
            const wasActivity = state.currentActivity;
            state.currentActivity = null;
            state.startTime = null;
            state.pausedTime = 0;
            state.totalPausedDuration = 0;
            state.isPaused = false;
            state.isRunning = false;
            state.lastPauseTime = null;

            // Reset UI
            updateStatus('idle', 'Pronto para iniciar');
            document.getElementById('currentActivityName').textContent = 'SELECIONE UMA ATIVIDADE';
            document.getElementById('mainTimer').textContent = '00:00:00';
            document.getElementById('focusTimerDisplay').textContent = '00:00:00';
            document.getElementById('mainTimer').classList.remove('paused');
            document.getElementById('timerCircle').classList.remove('paused');
            document.getElementById('focusTimerDisplay').classList.remove('paused');
            
            // Reset circle
            document.getElementById('timerCircle').style.strokeDashoffset = 616;
            
            // Remove active states
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            
            // Show initial controls
            showControls('idle');
            
            // Close focus mode if open
            document.getElementById('focusMode').classList.remove('active');
        }

        function updateTimer() {
            if (!state.isRunning || state.isPaused) return;

            const now = Date.now();
            const elapsed = now - state.startTime - state.totalPausedDuration;
            const totalSeconds = Math.floor(elapsed / 1000);
            
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            document.getElementById('mainTimer').textContent = timeStr;
            document.getElementById('focusTimerDisplay').textContent = timeStr;
            
            // Update circle progress (1 hour cycle)
            const circle = document.getElementById('timerCircle');
            const circumference = 2 * Math.PI * 98;
            const progress = (totalSeconds % 3600) / 3600;
            circle.style.strokeDashoffset = circumference * (1 - progress);
        }

        // UI Control Functions
        function showControls(mode) {
            const btnQuick = document.getElementById('btnQuickStart');
            const btnChoose = document.getElementById('btnChoose');
            const btnPause = document.getElementById('btnPause');
            const btnResume = document.getElementById('btnResume');
            const btnStop = document.getElementById('btnStop');

            // Hide all first
            [btnQuick, btnChoose, btnPause, btnResume, btnStop].forEach(btn => {
                btn.classList.add('hidden');
            });

            if (mode === 'idle') {
                btnQuick.classList.remove('hidden');
                btnChoose.classList.remove('hidden');
            } else if (mode === 'running') {
                btnPause.classList.remove('hidden');
                btnStop.classList.remove('hidden');
            } else if (mode === 'paused') {
                btnResume.classList.remove('hidden');
                btnStop.classList.remove('hidden');
            }
        }

        function updateStatus(status, text) {
            const indicator = document.getElementById('timerStatus');
            const statusContainer = document.getElementById('statusContainer');
            const statusText = document.getElementById('statusText');
            
            // Remove all status classes
            indicator.classList.remove('active', 'paused', 'idle');
            statusContainer.classList.remove('active', 'paused', 'idle');
            
            // Add appropriate class
            indicator.classList.add(status);
            statusContainer.classList.add(status);
            
            // Update text
            const statusLabel = indicator.querySelector('span:last-child');
            statusLabel.textContent = text;
            statusText.textContent = text;
        }

        function addToTimeline(category, minutes) {
            const container = document.getElementById('timelineContainer');
            const emptyMsg = document.getElementById('emptyTimeline');
            
            if (emptyMsg) {
                emptyMsg.remove();
            }

            const activity = activities[category];
            const now = new Date();
            const endTime = new Date(now.getTime() - minutes * 60000);
            
            const item = document.createElement('div');
            item.className = 'timeline-item pl-6 py-4 relative';
            item.innerHTML = `
                <div class="absolute left-0 top-5 w-2 h-2 rounded-full bg-${activity.color}-500"></div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm font-medium">${activity.name}</div>
                        <div class="text-xs text-gray-500 mt-0.5">Há ${minutes} minutos</div>
                    </div>
                    <div class="text-sm text-gray-400 font-mono">${minutes}m</div>
                </div>
            `;
            
            container.insertBefore(item, container.firstChild);
        }

        // Focus Mode
        function toggleFocusMode() {
            const focus = document.getElementById('focusMode');
            focus.classList.toggle('active');
            
            if (focus.classList.contains('active') && state.currentActivity) {
                document.getElementById('focusActivityName').textContent = activities[state.currentActivity].name;
                
                // Update focus pause button
                const focusPauseBtn = document.getElementById('focusPauseBtn');
                if (state.isPaused) {
                    focusPauseBtn.textContent = 'CONTINUAR';
                } else {
                    focusPauseBtn.textContent = 'PAUSAR';
                }
            }
        }

        // Mission
        function completeMission() {
            const btn = document.getElementById('missionBtn');
            btn.textContent = '✓ Concluído';
            btn.classList.add('text-green-400');
            btn.disabled = true;
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (state.isRunning) {
                    togglePause();
                }
            }
            if (e.code === 'Escape') {
                if (document.getElementById('activityModal').classList.contains('active')) {
                    closeActivityModal();
                } else if (document.getElementById('focusMode').classList.contains('active')) {
                    toggleFocusMode();
                } else if (state.isRunning) {
                    stopActivity();
                }
            }
        });

        // Close modal on backdrop click
        document.getElementById('activityModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeActivityModal();
            }
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            showControls('idle');
            
            // Animate LBI ring
            setTimeout(() => {
                const ring = document.getElementById('lbiRing');
                const circumference = 2 * Math.PI * 120;
                const offset = circumference - (84 / 100) * circumference;
                ring.style.strokeDashoffset = offset;
            }, 500);
        });
    </script>