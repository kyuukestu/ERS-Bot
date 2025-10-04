import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
	apps: [
		{
			name: 'ERS-bot',
			script: path.resolve(__dirname, 'src/index.ts'), // absolute path to your bot
			interpreter: path.resolve(__dirname, 'node_modules/.bin/ts-node'), // local ts-node
			cwd: path.resolve(__dirname),
			watch: true, // watch for changes
			ignore_watch: ['node_modules', '.git', 'logs', '.DS_Store'],
			watch_options: { usePolling: true }, // macOS file system notifications
			cron_restart: '0 6 * * *', // daily restart at 6 AM
			restart_delay: 10000, // 10s delay before restart
			max_memory_restart: '200M', // restart if memory exceeds 200MB
			out_file: path.resolve(__dirname, 'logs/out.log'),
			error_file: path.resolve(__dirname, 'logs/error.log'),
		},
	],
};

export default config;
