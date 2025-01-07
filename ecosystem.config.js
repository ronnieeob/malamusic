module.exports = {
  apps: [{
    name: 'metal-aloud-api',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    cwd: '/home/username/metal_aloud',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};