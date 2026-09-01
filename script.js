document.addEventListener('DOMContentLoaded', () => {
    // Часы и дата
    const liveTime = document.getElementById('live-time');
    const liveDate = document.getElementById('live-date');

    function updateClock() {
        const now = new Date();
        liveTime.textContent = now.toLocaleTimeString('ru-RU');
        liveDate.textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Настройки фона и меню
    const settingsBtn = document.getElementById('settings-btn');
    const themeMenu = document.getElementById('theme-menu');
    settingsBtn.addEventListener('click', () => themeMenu.classList.toggle('hidden'));

    // Восстановление сохраненного фона при старте
    const savedBg = localStorage.getItem('customBg');
    const savedTheme = localStorage.getItem('themeClass');
    const savedBlur = localStorage.getItem('blurVal');
    const savedDarkness = localStorage.getItem('darknessVal');

    if (savedBg) {
        setMediaBackground(savedBg);
    } else if (savedTheme) {
        document.body.className = savedTheme;
    }

    if (savedBlur) {
        document.querySelectorAll('.glass').forEach(el => el.style.backdropFilter = `blur(${savedBlur}px)`);
        document.getElementById('blur-range').value = savedBlur;
        document.getElementById('blur-value').textContent = savedBlur;
    }

    if (savedDarkness) {
        document.getElementById('bg-overlay').style.background = `rgba(0, 0, 0, ${savedDarkness / 100})`;
        document.getElementById('darkness-range').value = savedDarkness;
        document.getElementById('darkness-value').textContent = savedDarkness;
    }

    // Смена градиентов
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-bg');
            document.body.className = theme;
            document.getElementById('media-bg-container').innerHTML = '';
            localStorage.removeItem('customBg');
            localStorage.setItem('themeClass', theme);
        });
    });

    // Загрузка файла с ПК через временную ссылку (без ограничения по размеру localStorage)
    const fileInput = document.getElementById('bg-file-input');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setMediaBackground(fileUrl, file.type.startsWith('video'));
            localStorage.setItem('customBgName', file.name);
            localStorage.removeItem('themeClass');
        }
    });

    // Применение по ссылке
    const urlInput = document.getElementById('bg-url-input');
    const applyUrlBtn = document.getElementById('apply-url-btn');
    applyUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            const isVideo = url.endsWith('.mp4') || url.includes('video');
            setMediaBackground(url, isVideo);
            localStorage.setItem('customBg', url);
            localStorage.removeItem('themeClass');
        }
    });

    function setMediaBackground(src, isVideo = false) {
        const container = document.getElementById('media-bg-container');
        if (isVideo) {
            container.innerHTML = `<video src="${src}" autoplay loop muted></video>`;
        } else {
            container.innerHTML = `<img src="${src}" alt="Background">`;
        }
    }

    // Ползунки настройки
    const blurRange = document.getElementById('blur-range');
    const blurValue = document.getElementById('blur-value');
    blurRange.addEventListener('input', (e) => {
        const val = e.target.value;
        blurValue.textContent = val;
        document.querySelectorAll('.glass').forEach(el => el.style.backdropFilter = `blur(${val}px)`);
        localStorage.setItem('blurVal', val);
    });

    const darknessRange = document.getElementById('darkness-range');
    const darknessValue = document.getElementById('darkness-value');
    darknessRange.addEventListener('input', (e) => {
        const val = e.target.value;
        darknessValue.textContent = val;
        document.getElementById('bg-overlay').style.background = `rgba(0, 0, 0, ${val / 100})`;
        localStorage.setItem('darknessVal', val);
    });

    // Логика календаря
    let currentDate = new Date();
    const monthYear = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYear.textContent = `${months[month]} ${year}`;
        daysGrid.innerHTML = '';

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevTotalDays = new Date(year, month, 0).getDate();

        // Прошлый месяц
        for (let i = firstDayIndex; i > 0; i--) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell', 'inactive');
            cell.textContent = prevTotalDays - i + 1;
            daysGrid.appendChild(cell);
        }

        // Текущий месяц
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell');
            cell.textContent = i;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            cell.addEventListener('click', () => openModal(dateStr));

            daysGrid.appendChild(cell);
        }

        // Следующий месяц
        const totalCells = firstDayIndex + totalDays;
        const nextDays = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let i = 1; i <= nextDays; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell', 'inactive');
            cell.textContent = i;
            daysGrid.appendChild(cell);
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

    // Модальное окно заметок и будильника
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('modal-date-title');
    const noteText = document.getElementById('note-text');
    const alarmDate = document.getElementById('alarm-date');
    const alarmTime = document.getElementById('alarm-time');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    let activeDateStr = '';

    function openModal(dateStr) {
        activeDateStr = dateStr;
        modalTitle.textContent = `Заметки на ${dateStr}`;
        noteText.value = localStorage.getItem('note_' + dateStr) || '';
        alarmDate.value = dateStr;
        alarmTime.value = localStorage.getItem('alarm_time_' + dateStr) || '08:00';
        modal.classList.remove('hidden');
    }

    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    saveNoteBtn.addEventListener('click', async () => {
        localStorage.setItem('note_' + activeDateStr, noteText.value);
        localStorage.setItem('alarm_time_' + activeDateStr, alarmTime.value);

        // Отправка будильника на сервер Vercel (папку api)
        if (alarmDate.value && alarmTime.value) {
            try {
                await fetch('/api/set-alarm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: alarmDate.value,
                        time: alarmTime.value,
                        note: noteText.value || 'Напоминание из календаря'
                    })
                });
                alert('Заметка сохранена и будильник отправлен в Telegram!');
            } catch (err) {
                console.error(err);
                alert('Заметка сохранена локально, но не удалось связаться с сервером будильника.');
            }
        } else {
            alert('Заметка успешно сохранена!');
        }

        modal.classList.add('hidden');
    });
});
