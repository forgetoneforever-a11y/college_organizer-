document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const settingsBtn = document.getElementById('settings-btn'); // Кнопка настроек (если есть в HTML)
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    const discordIdInput = document.getElementById('discord-id-input');
    const bgUrlInput = document.getElementById('bg-url-input');
    const blurRangeInput = document.getElementById('blur-range-input');
    const blurValueSpan = document.getElementById('blur-value'); // Если есть текст со значением размытия

    const bgVideo = document.getElementById('bg-video');
    const bgImage = document.getElementById('bg-image');
    const spotifyWidget = document.getElementById('spotify-widget');
    const glassPanels = document.querySelectorAll('.glass-panel, .panel, .modal'); // Селекторы твоих стеклянных панелей

    // Загрузка сохраненных настроек из localStorage
    const savedDiscordId = localStorage.getItem('discordId') || '1447208839576551457';
    const savedBgUrl = localStorage.getItem('bgUrl') || '';
    const savedBlur = localStorage.getItem('blurValue') || '8';

    // Инициализация полей ввода в модалке текущими значениями
    if (discordIdInput) discordIdInput.value = savedDiscordId;
    if (bgUrlInput) bgUrlInput.value = savedBgUrl;
    if (blurRangeInput) {
        blurRangeInput.value = savedBlur;
        if (blurValueSpan) blurValueSpan.textContent = savedBlur + 'px';
    }

    // Применение настроек при старте
    applyBackground(savedBgUrl);
    applyBlur(savedBlur);
    setupSpotify(savedDiscordId);

    // Управление модальным окном настроек
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    }
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }

    // Ползунок размытия в реальном времени
    if (blurRangeInput) {
        blurRangeInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (blurValueSpan) blurValueSpan.textContent = val + 'px';
            applyBlur(val);
        });
    }

    // Сохранение настроек
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newDiscordId = discordIdInput ? discordIdInput.value.trim() : '';
            const newBgUrl = bgUrlInput ? bgUrlInput.value.trim() : '';
            const newBlur = blurRangeInput ? blurRangeInput.value : '8';

            localStorage.setItem('discordId', newDiscordId);
            localStorage.setItem('bgUrl', newBgUrl);
            localStorage.setItem('blurValue', newBlur);

            applyBackground(newBgUrl);
            applyBlur(newBlur);
            setupSpotify(newDiscordId);

            if (settingsModal) settingsModal.classList.add('hidden');
        });
    }

    // Функция применения фона (с поддержкой локальных файлов и ссылок)
    function applyBackground(url) {
        if (!url) {
            if (bgVideo) {
                bgVideo.pause();
                bgVideo.src = '';
                bgVideo.classList.add('hidden');
            }
            if (bgImage) bgImage.classList.add('hidden');
            return;
        }

        // Если это видео (локальное имя файла заканчивается на mp4/webm или содержит путь/формат видео)
        if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video') || !url.startsWith('http')) {
            if (bgVideo) {
                bgVideo.src = url;
                bgVideo.classList.remove('hidden');
                if (bgImage) bgImage.classList.add('hidden');
                bgVideo.play().catch(e => console.log("Автоплей видео заблокирован браузером:", e));
            }
        } else {
            // Иначе считаем это картинкой по ссылке
            if (bgImage) {
                bgImage.style.backgroundImage = `url('${url}')`;
                bgImage.classList.remove('hidden');
            }
            if (bgVideo) {
                bgVideo.pause();
                bgVideo.classList.add('hidden');
            }
        }
    }

    // Функция применения эффекта Glassmorphism (размытия панелей)
    function applyBlur(val) {
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
        glassPanels.forEach(panel => {
            panel.style.backdropFilter = `blur(${val}px)`;
            panel.style.webkitBackdropFilter = `blur(${val}px)`;
        });
    }

    // Подключение к Lanyard WebSocket для виджета Spotify
    let lanyardWs = null;
    function setupSpotify(discordId) {
        if (!discordId) {
            if (spotifyWidget) spotifyWidget.classList.add('hidden');
            return;
        }

        if (lanyardWs) {
            lanyardWs.close();
        }

        try {
            lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

            lanyardWs.onopen = () => {
                lanyardWs.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: discordId }
                }));
            };

            lanyardWs.onerror = () => {
                console.log("Lanyard WebSocket connection error (обычно из-за ограничений сети/региона)");
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
                    console.error('Ошибка обработки данных Lanyard:', e);
                }
            };
        } catch (e) {
            console.log("Не удалось запустить WebSocket Lanyard");
            if (spotifyWidget) spotifyWidget.classList.add('hidden');
        }
    }
});
