const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const {mapDBSongToModel, mapDBDetailSongToModel} = require('../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongs({title, year, genre, performer, duration, albumId}) {
    const id = 'song-' + nanoid(16);

    const query = {
      // eslint-disable-next-line max-len
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Error adding song');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs');
    return result.rows.map(mapDBSongToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Song not found');
    }

    return result.rows.map(mapDBDetailSongToModel)[0];
  }

  async updateSongById(id, {title, year, genre, performer, duration, albumId}) {
    const query = {
      // eslint-disable-next-line max-len
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Error editing song');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Error deleting song');
    }
  }
}

module.exports = SongsService;
