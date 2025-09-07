module.exports = {
  apps: [{
    name: 'pizzaria-backend',
    script: 'npx',
    args: 'tsx backend/server.ts',
    cwd: '/var/www/apps/pizzaria_rodrigo',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
