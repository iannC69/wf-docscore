const webhookUrl = 'https://discordapp.com/api/webhooks/1540461053308051477/CZwlGvM9odIOR3gDLOvIvnSp9P84BGcE7ia5T0oytuPnK-vAPCTGDfIM6pt8bgF--uKe';

async function testNotifMention() {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '💬 <@996796351587287100> — <@371621920162185216> ți-a trimis un mesaj nou pe sarcina **"De verificat gambling"**!',
      embeds: [{
        title: '💬 Mesaj Nou pe Sarcină • De verificat gambling',
        url: 'http://localhost:3000/admin/tasks',
        description: '>>> 📝 <@371621920162185216> a scris în discuție:\n\n"<@996796351587287100> am verificat ruleta și e totul ok, te rog dă un ochi și la crash!"',
        color: 0xa855f7,
        fields: [
          { name: '📋 Sarcină', value: '[**De verificat gambling**](http://localhost:3000/admin/tasks)', inline: true },
          { name: '👤 Autor Notă', value: '<@371621920162185216>', inline: true },
          { name: '👥 Destinatari Notificați', value: '<@996796351587287100>', inline: true },
          { name: '⚡ Răspunde în Panoul Admin', value: '👉 [**Deschide Chat & Răspunde pe Sarcină**](http://localhost:3000/admin/tasks)', inline: false }
        ],
        footer: { text: 'WildFire Docs v1.8.5 • Task Discussion Thread' },
        timestamp: new Date().toISOString()
      }],
      allowed_mentions: {
        parse: ['users']
      }
    })
  });

  console.log('Discord #notificari with Discord Mentions status:', res.status);
}

testNotifMention();
