module.exports = {
  apps: [{
    name: 'sofihr',
    // Next 15 с output: 'standalone' нужно запускать через standalone server
    script: '.next/standalone/server.js',
    /**
     * Для 2 vCPU логично держать 2 инстанса (по одному на ядро).
     * При необходимости можно уменьшить до 1, просто поменяв это значение.
     */
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    /**
     * Ограничиваем память, чтобы раньше перезапустить процесс,
     * чем добраться до системного OOM.
     */
    max_memory_restart: '700M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Ограничиваем heap V8, чтобы Next не разрастался бесконтрольно
      NODE_OPTIONS: '--max_old_space_size=700'
    },
    error_file: '/home/ubuntu/sofihr.ru/logs/err.log',
    out_file: '/home/ubuntu/sofihr.ru/logs/out.log',
    log_file: '/home/ubuntu/sofihr.ru/logs/combined.log',
    time: true,
    // Настройки для graceful reload
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
}
