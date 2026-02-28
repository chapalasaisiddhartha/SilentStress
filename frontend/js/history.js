document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    loadHistory();
});

async function loadHistory() {
    const grid = document.getElementById('history-grid');
    const loader = document.getElementById('loader');

    try {
        const sessions = await fetchAPI('/chat/session');
        loader.style.display = 'none';

        if (sessions.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No chat history found.</p>';
            return;
        }

        sessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'glass-card history-card';

            card.innerHTML = `
                <div>
                    <h3 style="margin-bottom: 0.5rem;">Chat Session</h3>
                    <div class="history-meta">${date}</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                        Session ID: ${session._id.substring(0, 8)}...
                    </p>
                </div>
                <div class="history-actions">
                    <button class="btn btn-outline" style="border-color: rgba(239, 68, 68, 0.5); color: #ef4444;" onclick="deleteSession('${session._id}')">
                        Delete Session
                    </button>
                    <!-- In a real app we might link to view the exact log here, but for now we focus on viewing in chat -->
                </div>
            `;

            grid.appendChild(card);
        });

    } catch (err) {
        loader.style.display = 'none';
        grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--stress-color); text-align: center;">Error loading history: ${err.message}</p>`;
    }
}

async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
        await fetchAPI(`/chat/session/${sessionId}`, {
            method: 'DELETE'
        });

        // Refresh mapping
        document.getElementById('history-grid').innerHTML = '';
        document.getElementById('loader').style.display = 'block';
        loadHistory();
    } catch (err) {
        alert(err.message);
    }
}
