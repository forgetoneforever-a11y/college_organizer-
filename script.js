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

    // 2. Живые часы и дата в шапке
    function updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU');
        const timeStr = now.toLocaleTimeString('ru-RU');
        const el = document.getElementById('current-date-time');
        if (el) {
            el.textContent = `${dateStr} • ${timeStr}`;
        }
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 3. Сохранение расписания в localStorage
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

    // 4. Загрузка расписания при запуске
    const saved = localStorage.getItem('college_schedule');
    if (saved) {
        try {
            const scheduleData = JSON.parse(saved);
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

    // 5. Очистка расписания
    const clearBtn = document.getElementById('clear-schedule-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Очистить всё расписание?')) {
                document.querySelectorAll('.schedule-input').forEach(input => input.value = '');
                localStorage.removeItem('college_schedule');
            }
        });
    }

    // 6. Экспорт в PDF / Печать
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
