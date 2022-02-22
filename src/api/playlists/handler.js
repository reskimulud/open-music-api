const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    // eslint-disable-next-line max-len
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const {name = 'untitled'} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const respons = h.response({
        status: 'success',
        message: 'Playlist added',
        data: {
          playlistId,
        },
      });
      respons.code(201);
      return respons;
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);
      const {id: playlistId} = request.params;
      const {songId} = request.payload;

      const {id: credentialId} = request.auth.credentials;
      await this._service.verifyPlaylistOwner(playlistId, credentialId);

      const songlistId = await this._service.addSonglist(playlistId, songId);

      const response = h.response({
        status: 'success',
        message: 'Song added to playlist',
        data: {
          songlistId,
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const {id: credentialId} = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
        status: 'success',
        message: 'Playlists retrieved',
        data: {
          playlists,
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async getPlaylistByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      const playlist = await this._service.getPlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist retrieved',
        data: {
          playlist,
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist deleted',
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async deletePlaylistSongByIdHandler(request, h) {
    try {
      this._validator.validateDeletePlaylistSongPayload(request.payload);
      const {id: playlistId} = request.params;
      const {songId} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteSonglistByPlaylistAndSongId(playlistId, songId);

      return {
        status: 'success',
        message: 'Song deleted from playlist',
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
        message: 'Internal Server Error',
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
