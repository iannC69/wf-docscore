const fs = require('fs');

async function testCommentWebhook() {
  const d = JSON.parse(fs.readFileSync('data/doc_analytics.json', 'utf-8'));
  const task = d.tasks && d.tasks[0];
  if (!task) {
    console.log('No task found in store');
    return;
  }

  const webhookUrl = 'https://discordapp.com/api/webhooks/1540464724171296889/1zHMWpQujbbb2mEN4BPi7CsoSoJWKUum_TlmnZjnWA5ioZp-PVvD2Qeft-1rxwI3QjJ8';

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `💬 **@iannC69** ți-a trimis un mesaj nou pe sarcina **"${task.title}"**!`,
      embeds: [{
        title: `💬 Mesaj Nou pe Sarcină • ${task.title}`,
        description: `>>> 📝 **@iannC69 a scris în discuție:**\n\n"Am actualizat regulile și checklist-ul pentru versiunea mobile. Te rog verifică layout-ul pe iOS/Android!"`,
        color: 0xa855f7,
        fields: [
          { name: '📋 Sarcină', value: `[**${task.title}**](http://localhost:3000/admin/tasks)`, inline: true },
          { name: '👤 Trimis De', value: '**@iannC69**', inline: true },
          { name: '👥 Destinatari Notificați', value: '@iannC69, @Yakuza', inline: true },
          { name: '⚡ Răspunde în Panoul Admin', value: '👉 [**Deschide Chat & Răspunde pe Sarcină**](http://localhost:3000/admin/tasks)', inline: false }
        ],
        footer: { text: 'WF-DOCSCORE v1.8.5 • Task Discussion Thread' },
        timestamp: new Date().toISOString()
      }]
    })
  });

  console.log('Discord webhook status:', res.status);
}

testCommentWebhook();
