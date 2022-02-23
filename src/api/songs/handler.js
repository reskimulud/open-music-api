/* eslint-disable max-len */
class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {title, year, genre, performer, duration, albumId} = request.payload;

    const songId = await this._service.addSongs({title, year, genre, performer, duration, albumId});

    const response = h.response({
      status: 'success',
      message: 'Song added',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const {title, performer} = request.query;
    const songs = await this._service.getSongs({title, performer});

    return {
      status: 'success',
      message: 'Songs fetched',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const {id} = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      message: 'Song fetched',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    const {id} = request.params;
    this._validator.validateSongPayload(request.payload);
    const {title, year, genre, performer, duration, albumId} = request.payload;

    await this._service.updateSongById(id, {title, year, genre, performer, duration, albumId});

    return {
      status: 'success',
      message: 'Album updated',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const {id} = request.params;

    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Song deleted',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
