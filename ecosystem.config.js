const config = {
	apps: [
		{
			name: 'ERS-bot',
			script: 'src/index.ts',
			interpreter: './node_modules/.bin/ts-node',
			watch: true,
			ignore_watch: ['node_modules', '.git', 'logs', '.DS_Store'],
			watch_options: { usePolling: true },
			cron_restart: '0 6 * * *',
			restart_delay: 10000,
			max_memory_restart: '200M',
			out_file: 'logs/out.log',
			error_file: 'logs/error.log',
		},
	],
};

export default config;
