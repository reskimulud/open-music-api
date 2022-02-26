const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist was not added');
    }

    return result.rows[0].id;
  }

  async addSonglist(playlistId, songId) {
    const id = `songlist-${nanoid(16)}`;

    const queryPlaylist = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const playlist = await this._pool.query(queryPlaylist);

    if (!playlist.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const song = await this._pool.query(querySong);

    if (!song.rowCount) {
      throw new NotFoundError('Song not found');
    }

    const query = {
      text: 'INSERT INTO songlists VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Songlist was not added');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist
      LEFT JOIN users ON playlist.owner = users.id
      LEFT JOIN collaborations ON playlist.id = collaborations.playlist_id
      WHERE playlist.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const queryPlaylist = {
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist
      LEFT JOIN users ON playlist.owner = users.id
      WHERE playlist.id = $1`,
      values: [id],
    };

    const playlist = await this._pool.query(queryPlaylist);

    if (!playlist.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs JOIN songlists
      ON songlists.song_id = songs.id
      WHERE songlists.playlist_id = $1`,
      values: [playlist.rows[0].id],
    };

    const songs = await this._pool.query(querySongs);

    return {
      ...playlist.rows[0],
      songs: songs.rows,
    };
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }
  }

  async deleteSonglistByPlaylistAndSongId(playlistId, songId) {
    const query = {
      text: 'DELETE FROM songlists WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song not found');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);


    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('You are not the owner of this playlist');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw err;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw err;
      }
    }
  }

  async addPlaylistActivity(playlistId, userId, songId, action) {
    const id = `playlist_activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_activity
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      values: [id, playlistId, userId, songId, time, action],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist activity was not added');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_activity.action,
      playlist_activity.time FROM playlist_activity
      LEFT JOIN users ON playlist_activity.user_id = users.id
      LEFT JOIN songs ON playlist_activity.song_id = songs.id
      WHERE playlist_activity.playlist_id = $1
      ORDER BY playlist_activity.time ASC`,
      values: [playlistId],
    };

    const activities = await this._pool.query(query);

    if (!activities.rowCount) {
      throw new NotFoundError('Playlist activities not found');
    }

    return activities.rows;
  }
}

module.exports = PlaylistsService;
