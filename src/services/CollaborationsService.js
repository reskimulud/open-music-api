const {Pool} = require('pg');
const InvariantError = require('../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNONG id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Collaboration was not added');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      // eslint-disable-next-line max-len
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Collaboration was not deleted');
    }
  }

  async verifyColaborator(noteId, userId) {
    const query = {
      // eslint-disable-next-line max-len
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [noteId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('User is not a collaborator');
    }
  }
}

module.exports = CollaborationsService;
