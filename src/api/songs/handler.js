class SongsHandler {
  #service;
  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this.#validator.validateSongPayload(request.payload);

    const songId = await this.#service.addSongs(request.payload);

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
    const songs = await this.#service.getSongs(request.query);

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

    const song = await this.#service.getSongById(id);

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
    this.#validator.validateSongPayload(request.payload);

    await this.#service.updateSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Album updated',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const {id} = request.params;

    await this.#service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Song deleted',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
