const config: { apps: any[] } = {
	apps: [
		{
			name: 'ERS-bot',
			script: 'src/index.ts',
			interpreter: 'ts-node',
			cron_restart: '0 6 * * *',
			restart_delay: 10000,
			max_memory_restart: '200M',
		},
	],
};

export default config;
