async function check() {
  const url = 'https://waste-wizard-smart-waste-management-system-41w9wowqf.vercel.app/api/auth/get-session';
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
check();
