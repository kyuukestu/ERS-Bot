const config: { apps: any[] } = {
	apps: [
		{
			name: 'ERS-bot',
			script: 'src/index.ts',
			interpreter: 'ts-node',
			watch: true,
			ignore_watch: ['node_modules', '.git', 'logs', '.DS_Store'],
			watch_options: {
				usePolling: true, // needed for macOS file system notifications
			},
			cron_restart: '0 6 * * *',
			restart_delay: 10000,
			max_memory_restart: '200M',
		},
	],
};

export default config;
