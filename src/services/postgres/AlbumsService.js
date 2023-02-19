const {nanoid} = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const {mapDBAlbumsToModel} = require('../../utils');

class AlbumsService {
  #pool;
  #cacheService;

  constructor(pool, cacheService) {
    this.#pool = pool;
    this.#cacheService = cacheService;
  }

  async addAlbums({name, year}) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Error adding album');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this.#pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBAlbumsToModel);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query);

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songs = await this.#pool.query(querySongs);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }

    return {
      ...result.rows.map(mapDBAlbumsToModel)[0],
      songs: songs.rows,
    };
  }

  async updateAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Error editing album');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Error deleting album');
    }
  }

  async addAlbumCoverById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [coverUrl, id],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Error adding album cover');
    }
  }

  async _addAlbumLikeById(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Error adding album like');
    }
  }

  async _deleteAlbumLikeById(id, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [id, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Error deleting album like');
    }
  }

  async toggleAlbumLikeById(id, userId) {
    const queryAlbum = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const album = await this.#pool.query(queryAlbum);

    if (!album.rowCount) {
      throw new NotFoundError('Album not found');
    }

    const queryUserLike = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, id],
    };

    const userLike = await this.#pool.query(queryUserLike);
    this.#cacheService.delete(`albumLikes:${id}`);

    if (userLike.rowCount) {
      try {
        await this._deleteAlbumLikeById(id, userId);
        return 'Album unliked';
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    try {
      await this._addAlbumLikeById(id, userId);
      return 'Album liked';
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAlbumLikesById(id) {
    try {
      const result = await this.#cacheService.get(`albumLikes:${id}`);
      return {
        likes: JSON.parse(result),
        source: 'cache',
      };
    } catch {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this.#pool.query(query);

      // sudah menambahkan parameter ke 3 (expirationInSecond) dengan value 1800 (30 menit)
      // untuk menimpa default parameter yang ada di method CacheService.set()
      // https://github.com/reskimulud/open-music-api/commit/aac8df953bc0540172098c0f67635ae8210d5710
      this.#cacheService.set(`albumLikes:${id}`, JSON.stringify(result.rowCount), 1800);
      return {
        likes: result.rowCount,
        source: 'database',
      };
    }
  }
}

module.exports = AlbumsService;
