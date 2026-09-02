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
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });

    // 2. Живые часы и дата в шапке + боковой панели
    function updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU');
        const timeStr = now.toLocaleTimeString('ru-RU');
        
        // В шапке
        const headerEl = document.getElementById('current-date-time');
        if (headerEl) {
            headerEl.textContent = `${dateStr} • ${timeStr}`;
        }

        // В боковой панели календаря
        const liveTime = document.getElementById('live-time');
        const liveDate = document.getElementById('live-date');
        if (liveTime) liveTime.textContent = timeStr;
        if (liveDate) {
            liveDate.textContent = now.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 3. Логика интерактивного календаря
    const daysGrid = document.getElementById('days-grid');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Модальное окно
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

        // Первый день месяца
        const firstDayIndex = new Date(year, month, 1).getDay();
        // Корректировка для Пн (в JS воскресенье = 0)
        const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

        // Последний день месяца
        const lastDay = new Date(year, month + 1, 0).getDate();
        // Последний день предыдущего месяца
        const prevLastDay = new Date(year, month, 0).getDate();

        let notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');

        // Пустые ячейки для дней предыдущего месяца
        for (let i = adjustedFirstDay; i > 0; i--) {
            const div = document.createElement('div');
            div.classList.add('calendar-day', 'inactive');
            div.textContent = prevLastDay - i + 1;
            daysGrid.appendChild(div);
        }

        // Дни текущего месяца
        for (let i = 1; i <= lastDay; i++) {
            const div = document.createElement('div');
            div.classList.add('calendar-day');
            div.textContent = i;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Подсветка сегодняшнего дня
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                div.classList.add('today');
            }

            // Если есть заметка — добавляем класс
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

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
        });
    }

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            let notes = JSON.parse(localStorage.getItem('calendar_notes') || '{}');
            notes[selectedDateStr] = {
                text: noteText ? noteText.value : '',
                alarmDate: alarmDate ? alarmDate.value : '',
                alarmTime: alarmTime ? alarmTime.value : ''
            };
            localStorage.setItem('calendar_notes', JSON.stringify(notes));
            if (modal) modal.classList.add('hidden');
            renderCalendar();
        });
    }

    renderCalendar();

    // 4. Сохранение расписания в localStorage
    const saveBtn = document.getElementById('save-schedule-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.schedule-input');
            const scheduleData = {};
            inputs.forEach((input, index) => {
                scheduleData[index] = input.value;
            });
            localStorage.setItem('college_schedule', JSON.stringify(scheduleData));
            alert('Расписание успешно сохранено!');
        });
    }

    // 5. Загрузка расписания при запуске
    const savedSchedule = localStorage.getItem('college_schedule');
    if (savedSchedule) {
        try {
            const scheduleData = JSON.parse(savedSchedule);
            const inputs = document.querySelectorAll('.schedule-input');
            inputs.forEach((input, index) => {
                if (scheduleData[index] !== undefined) {
                    input.value = scheduleData[index];
                }
            });
        } catch (e) {
            console.error('Ошибка загрузки расписания', e);
        }
    }

    // 6. Очистка расписания
    const clearBtn = document.getElementById('clear-schedule-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Очистить всё расписание?')) {
                document.querySelectorAll('.schedule-input').forEach(input => input.value = '');
                localStorage.removeItem('college_schedule');
            }
        });
    }

    // 7. Экспорт в PDF / Печать
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
