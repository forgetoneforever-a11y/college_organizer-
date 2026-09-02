// 1. Переключение между вкладками (Календарь / Расписание)
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-tab');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(targetId).classList.add('active');
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
document.getElementById('save-schedule-btn')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.schedule-input');
    const scheduleData = {};

    inputs.forEach((input, index) => {
        scheduleData[index] = input.value;
    });

    localStorage.setItem('college_schedule', JSON.stringify(scheduleData));
    alert('Расписание успешно сохранено!');
});

// 4. Загрузка расписания при запуске страницы
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('college_schedule');
    if (saved) {
        const scheduleData = JSON.parse(saved);
        const inputs = document.querySelectorAll('.schedule-input');
        inputs.forEach((input, index) => {
            if (scheduleData[index] !== undefined) {
                input.value = scheduleData[index];
            }
        });
    }
});

// 5. Очистка расписания
document.getElementById('clear-schedule-btn')?.addEventListener('click', () => {
    if (confirm('Очистить всё расписание?')) {
        document.querySelectorAll('.schedule-input').forEach(input => input.value = '');
        localStorage.removeItem('college_schedule');
    }
});

// 6. Экспорт в PDF / Печать
document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
    window.print();
});
