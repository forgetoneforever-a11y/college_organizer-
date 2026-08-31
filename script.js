document.addEventListener('DOMContentLoaded', () => {
    const monthYearElement = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    const settingsBtn = document.getElementById('settings-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    const bgFileInput = document.getElementById('bg-file-input');
    const bgUrlInput = document.getElementById('bg-url-input');
    const applyUrlBtn = document.getElementById('apply-url-btn');
    const mediaContainer = document.getElementById('media-bg-container');

    const blurRange = document.getElementById('blur-range');
    const blurValueSpan = document.getElementById('blur-value');

    const darknessRange = document.getElementById('darkness-range');
    const darknessValueSpan = document.getElementById('darkness-value');

    const liveTimeEl = document.getElementById('live-time');
    const liveDateEl = document.getElementById('live-date');

    const modal = document.getElementById('note-modal');
    const modalDateTitle = document.getElementById('modal-date-title');
    const noteText = document.getElementById('note-text');
    const alarmDateInput = document.getElementById('alarm-date');
    const alarmTimeInput = document.getElementById('alarm-time');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let currentDate = new Date();
    let selectedDateKey = '';
    let notesData = JSON.parse(localStorage.getItem('calendar-notes')) || {};
    let alarmsData = JSON.parse(localStorage.getItem('calendar-alarms')) || {};
    let alarmsDateData = JSON.parse(localStorage.getItem('calendar-alarms-dates')) || {};

    // Инициализация IndexedDB для хранения фоновых файлов
    let db;
    const request = indexedDB.open('CalendarDB', 1);
    
    request.onerror = () => console.log('Ошибка открытия IndexedDB');
    request.onsuccess = (e) => {
        db = e.target.result;
        loadSavedBackground();
    };
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files');
        }
    };

    function saveFileToDB(key, fileBlob) {
        if (!db) return;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        store.put(fileBlob, key);
    }

    function getFileFromDB(key, callback) {
        if (!db) return;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.get(key);
        request.onsuccess = () => {
            callback(request.result);
        };
    }

    // Часы и дата в реальном времени
    function updateLiveClock() {
        const now = new Date();
        liveTimeEl.textContent = now.toLocaleTimeString('ru-RU');
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        liveDateEl.textContent = now.toLocaleDateString('ru-RU', options);
    }
    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    // Размытие стекла
    const savedBlur = localStorage.getItem('glass-blur') || '16';
    document.documentElement.style.setProperty('--glass-blur', `${savedBlur}px`);
    blurRange.value = savedBlur;
    blurValueSpan.textContent = savedBlur;

    blurRange.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
        blurValueSpan.textContent = val;
        localStorage.setItem('glass-blur', val);
    });

    // Затемнение фона
    const savedDarkness = localStorage.getItem('bg-darkness') || '30';
    document.documentElement.style.setProperty('--bg-darkness', savedDarkness / 100);
    darknessRange.value = savedDarkness;
    darknessValueSpan.textContent = savedDarkness;

    darknessRange.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--bg-darkness', val / 100);
        darknessValueSpan.textContent = val;
        localStorage.setItem('bg-darkness', val);
    });

    settingsBtn.addEventListener('click', () => {
        themeMenu.classList.toggle('hidden');
    });

    themeOptions.forEach(button => {
        button.addEventListener('click', () => {
            const bgClass = button.getAttribute('data-bg');
            document.body.className = bgClass;
            mediaContainer.innerHTML = '';
            localStorage.setItem('bg-type', 'class');
            localStorage.setItem('bg-value', bgClass);
        });
    });

    bgFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video');
        const fileURL = URL.createObjectURL(file);

        setMediaBackground(fileURL, isVideo ? 'video' : 'image');
        saveFileToDB('backgroundMedia', file);

        localStorage.setItem('bg-type', isVideo ? 'video' : 'image');
        localStorage.removeItem('bg-value');
    });

    applyUrlBtn.addEventListener('click', () => {
        const url = bgUrlInput.value.trim();
        if (!url) return;

        const isVideo = url.endsWith('.mp4') || url.includes('video');
        setMediaBackground(url, isVideo ? 'video' : 'image');

        localStorage.setItem('bg-type', isVideo ? 'video' : 'image');
        localStorage.setItem('bg-value', url);
    });

    function setMediaBackground(src, type) {
        document.body.className = '';
        mediaContainer.innerHTML = '';

        if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            mediaContainer.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = src;
            mediaContainer.appendChild(img);
        }
    }

    function loadSavedBackground() {
        const savedType = localStorage.getItem('bg-type');
        const savedValue = localStorage.getItem('bg-value');

        if (savedType === 'class') {
            document.body.className = savedValue || 'bg-1';
        } else if (savedType === 'image' || savedType === 'video') {
            if (savedValue) {
                setMediaBackground(savedValue, savedType);
            } else {
                getFileFromDB('backgroundMedia', (fileBlob) => {
                    if (fileBlob) {
                        const fileURL = URL.createObjectURL(fileBlob);
                        setMediaBackground(fileURL, savedType);
                    }
                });
            }
        }
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthsNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        monthYearElement.textContent = `${monthsNames[month]} ${year}`;
        daysGrid.innerHTML = '';

        const firstDayIndex = new Date(year, month, 1).getDay();
        const startingPoint = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();

        const today = new Date();

        for (let i = 0; i < startingPoint; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'disabled');
            daysGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dayCell.classList.add('today');
            }

            const numberDiv = document.createElement('div');
            numberDiv.classList.add('day-number');
            numberDiv.textContent = day;
            dayCell.appendChild(numberDiv);

            if (notesData[dateKey]) {
                const notePreview = document.createElement('div');
                notePreview.classList.add('day-note-preview');
                notePreview.textContent = notesData[dateKey];
                dayCell.appendChild(notePreview);
            }

            dayCell.addEventListener('click', () => {
                selectedDateKey = dateKey;
                modalDateTitle.textContent = `Заметки: ${day} ${monthsNames[month]} ${year}`;
                noteText.value = notesData[dateKey] || '';
                
                alarmDateInput.value = alarmsDateData[dateKey] || dateKey;
                alarmTimeInput.value = alarmsData[dateKey] || '';
                
                modal.classList.remove('hidden');
            });

            daysGrid.appendChild(dayCell);
        }
    }

    saveNoteBtn.addEventListener('click', () => {
        if (!selectedDateKey) return;

        const text = noteText.value.trim();
        const alarmDate = alarmDateInput.value;
        const alarmTime = alarmTimeInput.value;

        if (text) {
            notesData[selectedDateKey] = text;
        } else {
            delete notesData[selectedDateKey];
        }

        if (alarmTime && alarmDate) {
            alarmsData[selectedDateKey] = alarmTime;
            alarmsDateData[selectedDateKey] = alarmDate;
            
            fetch('/api/set-alarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: alarmDate,
                    time: alarmTime,
                    text: text || 'Напоминание из календаря',
                    chatId: '8870678654'
                })
            }).catch(err => console.log('Ошибка отправки будильника на сервер:', err));
        } else {
            delete alarmsData[selectedDateKey];
            delete alarmsDateData[selectedDateKey];
        }

        localStorage.setItem('calendar-notes', JSON.stringify(notesData));
        localStorage.setItem('calendar-alarms', JSON.stringify(alarmsData));
        localStorage.setItem('calendar-alarms-dates', JSON.stringify(alarmsDateData));
        modal.classList.add('hidden');
        renderCalendar();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});