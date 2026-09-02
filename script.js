document.addEventListener('DOMContentLoaded', () => {
    // --- Управление вкладками ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- Живые часы ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU');
        const dateString = now.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeEl = document.getElementById('live-time');
        const dateEl = document.getElementById('live-date');
        if (timeEl) timeEl.textContent = timeString;
        if (dateEl) dateEl.textContent = dateString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Календарь ---
    let currentDate = new Date();
    const daysGrid = document.getElementById('days-grid');
    const monthYearDisplay = document.getElementById('month-year-display');

    function renderCalendar() {
        if (!daysGrid) return;
        daysGrid.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthsNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        monthYearDisplay.textContent = `${monthsNames[month]} ${year}`;

        // Первый день месяца и общее количество дней
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevTotalDays = new Date(year, month, 0).getDate();

        const notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');
        const today = new Date();

        // Дни предыдущего месяца
        for (let i = firstDayIndex; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'inactive');
            dayDiv.textContent = prevTotalDays - i + 1;
            daysGrid.appendChild(dayDiv);
        }

        // Дни текущего месяца
        for (let i = 1; i <= totalDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Проверка на сегодняшний день
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Наличие заметок
            if (notes[dateKey]) {
                dayDiv.classList.add('has-note');
            }

            // Клик по дню для открытия заметок
            dayDiv.addEventListener('click', () => openNoteModal(dateKey, i, monthsNames[month], year));

            daysGrid.appendChild(dayDiv);
        }
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();

    // --- Модальное окно заметок ---
    const noteModal = document.getElementById('note-modal');
    const noteModalDate = document.getElementById('note-modal-date');
    const noteText = document.getElementById('note-text');
    const closeNoteModal = document.getElementById('close-note-modal');
    const saveNoteBtn = document.getElementById('save-note-btn');
    let activeDateKey = '';

    function openNoteModal(dateKey, day, monthName, year) {
        activeDateKey = dateKey;
        noteModalDate.textContent = `Заметки на ${day} ${monthName} ${year}`;
        const notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');
        noteText.value = notes[dateKey] || '';
        noteModal.classList.remove('hidden');
    }

    closeNoteModal.addEventListener('click', () => noteModal.classList.add('hidden'));

    saveNoteBtn.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');
        if (noteText.value.trim() === '') {
            delete notes[activeDateKey];
        } else {
            notes[activeDateKey] = noteText.value;
        }
        localStorage.setItem('calendar_notes', JSON.stringify(notes));
        noteModal.classList.add('hidden');
        renderCalendar();
    });

    // --- Модальное окно настроек ---
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('open-settings');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const bgUrlInput = document.getElementById('bg-url-input');
    const blurRange = document.getElementById('blur-range');
    const blurVal = document.getElementById('blur-val');

    openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    blurRange.addEventListener('input', (e) => {
        blurVal.textContent = e.target.value;
        document.documentElement.style.setProperty('--glass-blur', e.target.value + 'px');
    });

    // Загрузка сохраненных настроек
    const savedBg = localStorage.getItem('bg_url');
    if (savedBg) {
        bgUrlInput.value = savedBg;
        applyBackground(savedBg);
    }

    saveSettingsBtn.addEventListener('click', () => {
        const bgVal = bgUrlInput.value.trim();
        localStorage.setItem('bg_url', bgVal);
        applyBackground(bgVal);
        settingsModal.classList.add('hidden');
    });

    function applyBackground(url) {
        const videoEl = document.getElementById('bg-video');
        const imageEl = document.getElementById('bg-image');
        if (!url) return;

        if (url.endsWith('.mp4') || url.includes('raw.githubusercontent.com') && url.includes('.mp4')) {
            videoEl.innerHTML = `<source src="${url}" type="video/mp4">`;
            videoEl.load();
            videoEl.classList.remove('hidden');
            imageEl.classList.add('hidden');
        } else {
            videoEl.classList.add('hidden');
            imageEl.style.backgroundImage = `url('${url}')`;
            imageEl.style.backgroundSize = 'cover';
            imageEl.style.backgroundPosition = 'center';
            imageEl.classList.remove('hidden');
        }
    }
});
