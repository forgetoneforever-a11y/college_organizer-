module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, time, note } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({ error: 'Telegram credentials are not configured in Vercel environment variables.' });
    }

    const message = `⏰ *Будильник / Заметка*\n📅 Дата: ${date}\n🕒 Время: ${time}\n📝 Текст: ${note}`;
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();
        if (data.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ error: data.description });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
