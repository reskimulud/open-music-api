/* eslint-disable max-len */
const {Pool} = require('pg');
const {nanoid} = require('nanoid');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbums({name, year}) {
    const id = 'album-' + nanoid(16);

    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('Error adding album');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows;
  }

  async getAlbumsById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('Album not found');
    }

    return result.rows[0];
  }

  async editAlbumsById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('Error editing album');
    }
  }

  async deleteAlbumsById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('Error deleting album');
    }
  }
}

module.exports = AlbumsService;
