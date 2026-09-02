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

    // Элементы часов и календаря
    const liveTimeEl = document.getElementById('live-time');
    const liveDateEl = document.getElementById('live-date');
    const monthYearEl = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Элементы модального окна заметок и будильника
    const noteModal = document.getElementById('note-modal');
    const modalDateTitle = document.getElementById('modal-date-title');
    const noteTextarea = document.getElementById('note-text');
    const alarmDateInput = document.getElementById('alarm-date');
    const alarmTimeInput = document.getElementById('alarm-time');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Расписание
    const scheduleInputs = document.querySelectorAll('.schedule-input');
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const clearScheduleBtn = document.getElementById('clear-schedule-btn');

    // Вкладки
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Переключение вкладок
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Живые часы и дата
    function updateClock() {
        const now = new Date();
        if (liveTimeEl) {
            liveTimeEl.textContent = now.toTimeString().split(' ')[0];
        }
        if (liveDateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            liveDateEl.textContent = now.toLocaleDateString('ru-RU', options);
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Календарь
    let currentDate = new Date();
    let selectedDateStr = '';
    const monthsNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    function renderCalendar() {
        if (!monthYearEl || !daysGrid) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearEl.textContent = `${monthsNames[month]} ${year}`;
        daysGrid.innerHTML = '';

        const firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevTotalDays = new Date(year, month, 0).getDate();

        const notes = JSON.parse(localStorage.getItem('calendarNotes') || '{}');

        // Дни предыдущего месяца
        for (let i = adjustedFirstDay; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'inactive');
            dayDiv.textContent = prevTotalDays - i + 1;
            daysGrid.appendChild(dayDiv);
        }

        // Дни текущего месяца
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            if (notes[dateStr]) {
                dayDiv.classList.add('has-note');
            }

            dayDiv.addEventListener('click', () => {
                selectedDateStr = dateStr;
                if (modalDateTitle) modalDateTitle.textContent = `Заметки на ${i} ${monthsNames[month]} ${year}`;
                
                const noteData = notes[dateStr];
                if (typeof noteData === 'object' && noteData !== null) {
                    if (noteTextarea) noteTextarea.value = noteData.text || '';
                    if (alarmDateInput) alarmDateInput.value = noteData.alarmDate || '';
                    if (alarmTimeInput) alarmTimeInput.value = noteData.alarmTime || '';
                } else {
                    if (noteTextarea) noteTextarea.value = noteData || '';
                    if (alarmDateInput) alarmDateInput.value = '';
                    if (alarmTimeInput) alarmTimeInput.value = '';
                }

                if (noteModal) noteModal.classList.remove('hidden');
            });

            daysGrid.appendChild(dayDiv);
        }

        // Дни следующего месяца
        const totalCells = adjustedFirstDay + totalDays;
        const nextDaysCount = (totalCells <= 35) ? (35 - totalCells) : (42 - totalCells);
        for (let i = 1; i <= nextDaysCount; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'inactive');
            dayDiv.textContent = i;
            daysGrid.appendChild(dayDiv);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();

    // Сохранение заметок и будильника
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            const notes = JSON.parse(localStorage.getItem('calendarNotes') || '{}');
            const text = noteTextarea ? noteTextarea.value.trim() : '';
            const alarmDate = alarmDateInput ? alarmDateInput.value : '';
            const alarmTime = alarmTimeInput ? alarmTimeInput.value : '';

            if (text || alarmDate || alarmTime) {
                notes[selectedDateStr] = { text, alarmDate, alarmTime };
            } else {
                delete notes[selectedDateStr];
            }

            localStorage.setItem('calendarNotes', JSON.stringify(notes));
            if (noteModal) noteModal.classList.add('hidden');
            renderCalendar();
        });
    }

    if (closeModalBtn && noteModal) {
        closeModalBtn.addEventListener('click', () => noteModal.classList.add('hidden'));
    }

    // Сохранение и загрузка расписания
    const savedSchedule = JSON.parse(localStorage.getItem('collegeSchedule') || '{}');
    if (scheduleInputs.length > 0) {
        scheduleInputs.forEach((input, index) => {
            if (savedSchedule[index] !== undefined) {
                input.value = savedSchedule[index];
            }
        });
    }

    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', () => {
            const scheduleData = {};
            scheduleInputs.forEach((input, index) => {
                scheduleData[index] = input.value;
            });
            localStorage.setItem('collegeSchedule', JSON.stringify(scheduleData));
            alert('Расписание успешно сохранено!');
        });
    }

    if (clearScheduleBtn) {
        clearScheduleBtn.addEventListener('click', () => {
            if (confirm('Очистить всё расписание?')) {
                scheduleInputs.forEach(input => input.value = '');
                localStorage.removeItem('collegeSchedule');
            }
        });
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Инициализация модалок
    if (settingsModal) settingsModal.classList.add('hidden');
    if (noteModal) noteModal.classList.add('hidden');

    // Загрузка настроек интерфейса
    const savedDiscordId = localStorage.getItem('discordId') || '';
    const savedBgUrl = localStorage.getItem('bgUrl') || '';
    const savedBlur = localStorage.getItem('blurValue') || '12';

    if (discordIdInput) discordIdInput.value = savedDiscordId;
    if (bgUrlInput) bgUrlInput.value = savedBgUrl;
    if (blurRangeInput) {
        blurRangeInput.value = savedBlur;
        if (blurValueSpan) blurValueSpan.textContent = savedBlur;
    }

    applyBackground(savedBgUrl);
    applyBlur(savedBlur);
    setupSpotify(savedDiscordId);

    // Управление модальным окном настроек
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsModal.classList.remove('hidden');
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    if (blurRangeInput) {
        blurRangeInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (blurValueSpan) blurValueSpan.textContent = val;
            applyBlur(val);
        });
    }

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

    function applyBackground(url) {
        if (!bgVideo || !bgImage) return;
        if (!url || url.trim() === '') {
            bgVideo.pause();
            bgVideo.removeAttribute('src');
            bgVideo.load();
            bgVideo.classList.add('hidden');
            bgImage.classList.add('hidden');
            return;
        }

        if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video') || !url.startsWith('http')) {
            bgVideo.src = url;
            bgVideo.classList.remove('hidden');
            bgImage.classList.add('hidden');
            bgVideo.play().catch(e => console.log("Автоплей видео заблокирован:", e));
        } else {
            bgImage.style.backgroundImage = `url('${url}')`;
            bgImage.classList.remove('hidden');
            bgVideo.pause();
            bgVideo.classList.add('hidden');
        }
    }

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
                } catch (e) {}
            };
        } catch (e) {
            if (spotifyWidget) spotifyWidget.classList.add('hidden');
        }
    }
});
