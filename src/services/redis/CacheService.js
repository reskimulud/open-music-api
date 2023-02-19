const redis = require('redis');

class CacheService {
  #client;

  constructor() {
    this.#client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        database: process.env.REDIS_DATABASE,
      },
    });

    this.#client.on('error', (error) => {
      console.error(error);
    });

    this.#client.connect();
  }

  // Default nya memang satu jam tapi saat implementasinya
  // saya telah menambahkan parameter ke 3 (expirationInSecond) dengan value 1800 (30 menit)
  // lihat file src\services\postgres\AlbumsService.js
  async set(key, value, expirationInSecond = 3600) {
    await this.#client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this.#client.get(key);

    if (result === null) throw new Error('Cache not found');

    return result;
  }

  delete(key) {
    return this.#client.del(key);
  }
}

module.exports = CacheService;
