document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const settingsBtn = document.getElementById('open-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    
    const discordIdInput = document.getElementById('setting-discord-id');
    const bgUrlInput = document.getElementById('setting-bg-url');
    const blurRangeInput = document.getElementById('setting-blur-range');
    const blurValueSpan = document.getElementById('blur-value');

    const bgVideo = document.getElementById('bg-video');
    const bgImage = document.getElementById('bg-image');
    const spotifyWidget = document.getElementById('spotify-widget');
    const glassElements = document.querySelectorAll('.glass, .app-header, .sidebar, .calendar-main, .modal-content');

    // Гарантированно скрываем модалку настроек при старте
    if (settingsModal) {
        settingsModal.classList.add('hidden');
    }

    // Загрузка сохраненных настроек из localStorage
    const savedDiscordId = localStorage.getItem('discordId') || '';
    const savedBgUrl = localStorage.getItem('bgUrl') || '';
    const savedBlur = localStorage.getItem('blurValue') || '12';

    // Инициализация полей ввода текущими значениями
    if (discordIdInput) discordIdInput.value = savedDiscordId;
    if (bgUrlInput) bgUrlInput.value = savedBgUrl;
    if (blurRangeInput) {
        blurRangeInput.value = savedBlur;
        if (blurValueSpan) blurValueSpan.textContent = savedBlur;
    }

    // Применение настроек при старте
    applyBackground(savedBgUrl);
    applyBlur(savedBlur);
    setupSpotify(savedDiscordId);

    // Управление модальным окном настроек (открытие)
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsModal.classList.remove('hidden');
        });
    }

    // Закрытие модального окна настроек
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    // Закрытие по клику вне модального окна
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // Ползунок размытия в реальном времени
    if (blurRangeInput) {
        blurRangeInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (blurValueSpan) blurValueSpan.textContent = val;
            applyBlur(val);
        });
    }

    // Сохранение настроек
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newDiscordId = discordIdInput ? discordIdInput.value.trim() : '';
            const newBgUrl = bgUrlInput ? bgUrlInput.value.trim() : '';
            const newBlur = blurRangeInput ? blurRangeInput.value : '12';

            localStorage.setItem('discordId', newDiscordId);
            localStorage.setItem('bgUrl', newBgUrl);
            localStorage.setItem('blurValue', newBlur);

            applyBackground(newBgUrl);
            applyBlur(newBlur);
            setupSpotify(newDiscordId);

            if (settingsModal) settingsModal.classList.add('hidden');
        });
    }

    // Функция применения фона
    function applyBackground(url) {
        if (!bgVideo || !bgImage) return;
        if (!url) {
            bgVideo.pause();
            bgVideo.src = '';
            bgVideo.classList.add('hidden');
            bgImage.classList.add('hidden');
            return;
        }

        if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video') || !url.startsWith('http')) {
            bgVideo.src = url;
            bgVideo.classList.remove('hidden');
            bgImage.classList.add('hidden');
            bgVideo.play().catch(e => console.log("Автоплей видео заблокирован браузером:", e));
        } else {
            bgImage.style.backgroundImage = `url('${url}')`;
            bgImage.classList.remove('hidden');
            bgVideo.pause();
            bgVideo.classList.add('hidden');
        }
    }

    // Функция применения размытия
    function applyBlur(val) {
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
        glassElements.forEach(el => {
            el.style.backdropFilter = `blur(${val}px)`;
            el.style.webkitBackdropFilter = `blur(${val}px)`;
        });
    }

    // Подключение к Lanyard WebSocket для Spotify
    let lanyardWs = null;
    function setupSpotify(discordId) {
        if (!discordId) {
            if (spotifyWidget) spotifyWidget.classList.add('hidden');
            return;
        }

        if (lanyardWs) {
            try { lanyardWs.close(); } catch (e) {}
        }

        try {
            lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

            lanyardWs.onopen = () => {
                if (lanyardWs.readyState === WebSocket.OPEN) {
                    lanyardWs.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: discordId }
                    }));
                }
            };

            lanyardWs.onerror = () => {
                if (spotifyWidget) spotifyWidget.classList.add('hidden');
            };

            lanyardWs.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                        const presence = data.d;
                        if (presence && presence.spotify && presence.listening_to_spotify) {
                            const sp = presence.spotify;
                            
                            const songEl = document.getElementById('sp-song');
                            const artistEl = document.getElementById('sp-artist');
                            const artEl = document.getElementById('sp-album-art');

                            if (songEl) songEl.textContent = sp.song;
                            if (artistEl) artistEl.textContent = sp.artist;
                            if (artEl) artEl.src = sp.album_art_url;

                            if (spotifyWidget) spotifyWidget.classList.remove('hidden');
                        } else {
                            if (spotifyWidget) spotifyWidget.classList.add('hidden');
                        }
                    }
                } catch (e) {
                    // Игнорируем ошибки парсинга
                }
            };
        } catch (e) {
            if (spotifyWidget) spotifyWidget.classList.add('hidden');
        }
    }
});
