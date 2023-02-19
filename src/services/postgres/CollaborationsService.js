const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  #pool;

  constructor(pool) {
    this.#pool = pool;
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;

    const queryUser = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const user = await this.#pool.query(queryUser);

    if (!user.rowCount) {
      throw new NotFoundError('User not found');
    }

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration was not added');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration was not deleted');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('User is not a collaborator');
    }
  }
}

module.exports = CollaborationsService;
