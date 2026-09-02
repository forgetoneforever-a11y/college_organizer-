document.addEventListener('DOMContentLoaded', () => {
    // 1. Переключение между вкладками
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const targetElement = document.getElementById(targetId);
            if (targetElement) targetElement.classList.add('active');
        });
    });

    // 2. Живые часы и дата
    function updateDateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU');
        const liveTime = document.getElementById('live-time');
        const liveDate = document.getElementById('live-date');
        if (liveTime) liveTime.textContent = timeStr;
        if (liveDate) {
            liveDate.textContent = now.toLocaleDateString('ru-RU', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            });
        }
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 3. Календарь
    const daysGrid = document.getElementById('days-grid');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const modal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalDateTitle = document.getElementById('modal-date-title');
    const noteText = document.getElementById('note-text');
    const alarmDate = document.getElementById('alarm-date');
    const alarmTime = document.getElementById('alarm-time');
    const saveNoteBtn = document.getElementById('save-note-btn');

    let currentDate = new Date();
    let selectedDateStr = '';

    function renderCalendar() {
        if (!daysGrid || !monthYear) return;
        daysGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthsNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        monthYear.textContent = `${monthsNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        let notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');

        for (let i = adjustedFirstDay; i > 0; i--) {
            const div = document.createElement('div');
            div.classList.add('calendar-day', 'inactive');
            div.textContent = prevLastDay - i + 1;
            daysGrid.appendChild(div);
        }

        for (let i = 1; i <= lastDay; i++) {
            const div = document.createElement('div');
            div.classList.add('calendar-day');
            div.textContent = i;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                div.classList.add('today');
            }

            if (notes[dateStr] && notes[dateStr].text) {
                div.classList.add('has-note');
            }

            div.addEventListener('click', () => {
                selectedDateStr = dateStr;
                if (modalDateTitle) modalDateTitle.textContent = `Заметки на ${i} ${monthsNames[month]} ${year}`;
                if (noteText) noteText.value = notes[dateStr] ? notes[dateStr].text || '' : '';
                if (alarmDate) alarmDate.value = notes[dateStr] ? notes[dateStr].alarmDate || dateStr : dateStr;
                if (alarmTime) alarmTime.value = notes[dateStr] ? notes[dateStr].alarmTime || '' : '';
                if (modal) modal.classList.remove('hidden');
            });

            daysGrid.appendChild(div);
        }
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            let notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');
            notes[selectedDateStr] = {
                text: noteText ? noteText.value : '',
                alarmDate: alarmDate ? alarmDate.value : '',
                alarmTime: alarmTime ? alarmTime.value : ''
            };
            localStorage.setItem('calendar_notes', JSON.stringify(notes));
            modal.classList.add('hidden');
            renderCalendar();
        });
    }
    renderCalendar();

    // 4. Расписание (сохранение/загрузка)
    const saveBtn = document.getElementById('save-schedule-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.schedule-input');
            const scheduleData = {};
            inputs.forEach((input, index) => { scheduleData[index] = input.value; });
            localStorage.setItem('college_schedule', JSON.stringify(scheduleData));
            alert('Расписание успешно сохранено!');
        });
    }

    const savedSchedule = localStorage.getItem('college_schedule');
    if (savedSchedule) {
        try {
            const scheduleData = JSON.parse(savedSchedule);
            const inputs = document.querySelectorAll('.schedule-input');
            inputs.forEach((input, index) => {
                if (scheduleData[index] !== undefined) input.value = scheduleData[index];
            });
        } catch (e) { console.error(e); }
    }

    const clearBtn = document.getElementById('clear-schedule-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Очистить всё расписание?')) {
                document.querySelectorAll('.schedule-input').forEach(input => input.value = '');
                localStorage.removeItem('college_schedule');
            }
        });
    }

    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => window.print());

    // 5. Настройки, Фон, Размытие и Discord Spotify (Lanyard API)
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    const settingDiscordId = document.getElementById('setting-discord-id');
    const settingBgUrl = document.getElementById('setting-bg-url');
    const settingBlurRange = document.getElementById('setting-blur-range');
    const blurValueLabel = document.getElementById('blur-value');

    const bgVideo = document.getElementById('bg-video');
    const bgImage = document.getElementById('bg-image');
    const spotifyWidget = document.getElementById('spotify-widget');

    // Загрузка настроек из localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        
        if (settingDiscordId) settingDiscordId.value = settings.discordId || '';
        if (settingBgUrl) settingBgUrl.value = settings.bgUrl || '';
        if (settingBlurRange) settingBlurRange.value = settings.blur !== undefined ? settings.blur : 12;
        if (blurValueLabel) blurValueLabel.textContent = settingBlurRange.value;

        applyBlur(settingBlurRange.value);
        applyBackground(settings.bgUrl);
        setupSpotify(settings.discordId);
    }

    function applyBlur(blurPx) {
        document.documentElement.style.setProperty('--glass-blur', `${blurPx}px`);
    }

    function applyBackground(url) {
        if (!url) {
            bgVideo.classList.add('hidden');
            bgImage.classList.add('hidden');
            return;
        }

        if (url.endsWith('.mp4') || url.includes('video')) {
            bgVideo.src = url;
            bgVideo.classList.remove('hidden');
            bgImage.classList.add('hidden');
        } else {
            bgImage.style.backgroundImage = `url('${url}')`;
            bgImage.classList.remove('hidden');
            bgVideo.classList.add('hidden');
        }
    }

    // Подключение к Lanyard API (Discord Rich Presence для Spotify)
    let lanyardWs = null;
    function setupSpotify(discordId) {
        if (!discordId) {
            spotifyWidget.classList.add('hidden');
            return;
        }

        if (lanyardWs) lanyardWs.close();

        // Подключаемся к WebSocket Lanyard
        lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

        lanyardWs.onopen = () => {
            lanyardWs.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: discordId }
            }));
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
                console.error('Lanyard error:', e);
            }
        };
    }

    settingBlurRange.addEventListener('input', (e) => {
        blurValueLabel.textContent = e.target.value;
        applyBlur(e.target.value);
    });

    openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => { settingsModal.classList.add('hidden'); loadSettings(); });

    saveSettingsBtn.addEventListener('click', () => {
        const settings = {
            discordId: settingDiscordId.value.trim(),
            bgUrl: settingBgUrl.value.trim(),
            blur: settingBlurRange.value
        };
        localStorage.setItem('app_settings', JSON.stringify(settings));
        settingsModal.classList.add('hidden');
        loadSettings();
    });

    loadSettings();
});
