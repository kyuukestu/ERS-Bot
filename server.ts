const express = require('express');
const app = express();

app.get('/callback', (req: any, res: any) => {
	const code = req.query.code;
	if (!code) return res.send('No code provided.');

	res.send(`Authorization Code: ${code}`);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
