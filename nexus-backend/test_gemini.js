import 'dotenv/config';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e.message);
  }
}
test();
