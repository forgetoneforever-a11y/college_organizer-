function applyBackground(url) {
        if (!url) {
            bgVideo.classList.add('hidden');
            bgImage.classList.add('hidden');
            return;
        }

        // Если указан локальный файл или видео
        if (url.endsWith('.mp4') || url.includes('video') || !url.startsWith('http')) {
            bgVideo.src = url;
            bgVideo.classList.remove('hidden');
            bgImage.classList.add('hidden');
            bgVideo.play().catch(e => console.log("Автоплей видео заблокирован браузером:", e));
        } else {
            bgImage.style.backgroundImage = `url('${url}')`;
            bgImage.classList.remove('hidden');
            bgVideo.classList.add('hidden');
        }
    }

    let lanyardWs = null;
    function setupSpotify(discordId) {
        if (!discordId) {
            spotifyWidget.classList.add('hidden');
            return;
        }

        if (lanyardWs) lanyardWs.close();

        try {
            lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

            lanyardWs.onopen = () => {
                lanyardWs.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: discordId }
                }));
            };

            lanyardWs.onerror = (err) => {
                console.log("Lanyard WebSocket connection error (обычно из-за блокировки API)");
                spotifyWidget.classList.add('hidden');
            };

            lanyardWs.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                        const presence = data.d;
                        if (presence && presence.spotify && presence.listening_to_spotify) {
                            const sp = presence.spotify;
                            document.getElementById('sp-song').textContent = sp.song;
                            document.getElementById('sp-artist').textContent = sp.artist;
                            document.getElementById('sp-album-art').src = sp.album_art_url;
                            spotifyWidget.classList.remove('hidden');
                        } else {
                            spotifyWidget.classList.add('hidden');
                        }
                    }
                } catch (e) {
                    console.error('Lanyard parse error:', e);
                }
            };
        } catch (e) {
            console.log("Не удалось подключиться к Lanyard");
            spotifyWidget.classList.add('hidden');
        }
    }
