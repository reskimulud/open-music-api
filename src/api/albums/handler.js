const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const {name, year} = request.payload;

      const albumId = await this._service.addAlbums({name, year});

      const response = h.response({
        status: 'success',
        message: 'Album added',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }

  async getAlbumsHandler() {
    try {
      const albums = await this._service.getAlbums();

      return {
        status: 'success',
        message: 'Albums fetched',
        data: {
          albums,
        },
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        message: 'Album fetched',
        data: {
          album,
        },
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const {id} = request.params;

      await this._service.updateAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album updated',
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const {id} = request.params;

      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album deleted',
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
