const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Playlist was not added');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist
      LEFT JOIN users ON playlist.owner = users.id
      WHERE playlist.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist
      LEFT JOIN users ON playlist.owner = users.id
      WHERE playlist.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Playlist not found');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Playlist not found');
    }
  }
}

module.exports = PlaylistsService;
