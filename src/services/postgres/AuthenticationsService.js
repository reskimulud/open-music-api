const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  #pool;

  constructor(pool) {
    this.#pool = pool;
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token was not added');
    }
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token was not valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.#pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token was not deleted');
    }
  }
}

module.exports = AuthenticationsService;
