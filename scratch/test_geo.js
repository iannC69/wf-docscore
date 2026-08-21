const https = require('https');

async function testGeo() {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json').then(r => r.json());
    console.log('Real WAN IP:', ipRes.ip);
    const geoRes = await fetch(`https://ipwho.is/${ipRes.ip}`).then(r => r.json());
    console.log('Geo details:', {
      success: geoRes.success,
      country: geoRes.country,
      country_code: geoRes.country_code,
      city: geoRes.city,
      region: geoRes.region,
      isp: geoRes.connection?.isp
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

testGeo();
