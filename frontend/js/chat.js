let currentSessionId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = getUser();
    document.getElementById('user-greeting').innerText = `Welcome, ${user.name}`;

    const chatForm = document.getElementById('chat-form');
    const newChatBtn = document.getElementById('new-chat-btn');

    loadSessions();

    newChatBtn.addEventListener('click', createNewSession);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value.trim();

        if (!text) return;

        if (!currentSessionId) {
            await createNewSession();
        }

        input.value = '';
        appendMessage('user', text);

        try {
            const btn = document.getElementById('send-btn');
            btn.disabled = true;

            const response = await fetchAPI('/chat/message', {
                method: 'POST',
                body: JSON.stringify({ sessionId: currentSessionId, text })
            });

            appendMessage('sys', response.botResponse, response.stressPrediction);

        } catch (err) {
            alert(err.message);
        } finally {
            const btn = document.getElementById('send-btn');
            btn.disabled = false;
            document.getElementById('chat-input').focus();
        }
    });
});

async function loadSessions() {
    try {
        const sessions = await fetchAPI('/chat/session');
        const sessionList = document.getElementById('session-list');
        sessionList.innerHTML = '';

        if (sessions.length === 0) {
            sessionList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem;">No recent sessions</div>';
            return;
        }

        sessions.forEach((session, index) => {
            const date = new Date(session.startTime).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const div = document.createElement('div');
            div.className = `session-item ${index === 0 && !currentSessionId ? 'active' : ''}`;
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';

            div.innerHTML = `
                <span class="session-label" style="flex-grow: 1; cursor: pointer;">Session ${date}</span>
                <span class="delete-btn" style="cursor: pointer; color: #ef4444; font-size: 1.1em; padding-left: 10px;" title="Delete Chat">🗑️</span>
            `;

            div.querySelector('.session-label').onclick = () => loadSessionData(session._id, div);

            div.querySelector('.delete-btn').onclick = async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this chat session?')) {
                    await deleteSession(session._id, div);
                }
            };

            sessionList.appendChild(div);

            // Auto-load first session if no current session
            if (index === 0 && !currentSessionId) {
                loadSessionData(session._id, div);
            }
        });
    } catch (err) {
        console.error('Failed to load sessions', err);
    }
}

async function createNewSession() {
    try {
        const session = await fetchAPI('/chat/session', { method: 'POST' });
        currentSessionId = session._id;

        document.getElementById('chat-messages').innerHTML = `
            <div class="chat-bubble sys-bubble">
                Hello! I'm here to listen. How are you feeling today?
            </div>
        `;

        loadSessions(); // Refresh list
    } catch (err) {
        alert(err.message);
    }
}

async function loadSessionData(sessionId, element) {
    currentSessionId = sessionId;

    // Update active class
    if (element) {
        document.querySelectorAll('.session-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    try {
        const messages = await fetchAPI(`/chat/message/${sessionId}`);
        const chatContainer = document.getElementById('chat-messages');

        chatContainer.innerHTML = `
            <div class="chat-bubble sys-bubble">
                Hello! I'm here to listen. How are you feeling today?
            </div>
        `;

        messages.forEach(msg => {
            appendMessage('user', msg.userText);
            appendMessage('sys', msg.botResponse, msg.stressPrediction);
        });

        scrollToBottom();
    } catch (err) {
        console.error(err);
    }
}

function appendMessage(sender, text, prediction = null) {
    const chatContainer = document.getElementById('chat-messages');
    const bubble = document.createElement('div');

    bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'sys-bubble'}`;
    bubble.innerText = text;

    if (sender === 'sys' && prediction) {
        const badge = document.createElement('span');

        let badgeClass = 'badge-none';
        let badgeText = 'Neutral';

        if (prediction === 'High') {
            badgeClass = 'badge-stress';
            badgeText = 'High Stress Detected';
        } else if (prediction === 'Medium') {
            badgeClass = 'badge-stress'; // you can add badge-medium in css later if desired
            badgeText = 'Moderate Stress';
        } else if (prediction === 'Low') {
            badgeClass = 'badge-none';
            badgeText = 'Low Stress';
        }

        badge.className = `badge ${badgeClass}`;
        badge.innerText = badgeText;
        bubble.appendChild(badge);
    }

    chatContainer.appendChild(bubble);
    scrollToBottom();
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function deleteSession(sessionId, element) {
    try {
        await fetchAPI(`/chat/session/${sessionId}`, { method: 'DELETE' });

        // Remove element from DOM immediately
        element.remove();

        // If the active session was deleted, clear UI and reload to pick the next available session
        if (currentSessionId === sessionId) {
            currentSessionId = null;
            document.getElementById('chat-messages').innerHTML = `
                <div class="chat-bubble sys-bubble">
                    Hello! I'm here to listen. How are you feeling today?
                </div>
            `;
            loadSessions();
        }
    } catch (err) {
        console.error('Failed to delete session', err);
        alert('Failed to delete chat session.');
    }
}
