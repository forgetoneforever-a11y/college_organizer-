export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, time, text, chatId } = req.body;
    const BOT_TOKEN = '8949551278:AAGxkh8IpRxFPV1KxR6pcXR7Vh6niSTkPXg';

    const targetTime = new Date(`${date}T${time}:00`).getTime();
    const now = Date.now();
    const delay = targetTime - now;

    if (delay <= 0) {
        return res.status(400).json({ error: 'Указанное время уже прошло!' });
    }

    setTimeout(async () => {
        try {
            const message = `🔔 Напоминание на ${date} в ${time}:\n\n${text}`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            });
        } catch (e) {
            console.error('Ошибка отправки в Telegram:', e);
        }
    }, delay);

    return res.status(200).json({ success: true, message: 'Будильник успешно установлен!' });
}