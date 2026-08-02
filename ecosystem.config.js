module.exports = {
  apps: [
    {
      name: "discord-bot",
      script: "src/index.ts",
      interpreter: "bun",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
