class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumLikeByIdHandler = this.postAlbumLikeByIdHandler.bind(this);
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbums(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album added',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();

    return {
      status: 'success',
      message: 'Albums fetched',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      message: 'Album fetched',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const {id} = request.params;

    await this._service.updateAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album updated',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted',
    };
  }

  async postAlbumLikeByIdHandler(request, h) {
    const {id} = request.params;
    const {id: userId} = request.auth.credentials;

    const message = await this._service.toggleAlbumLikeById(id, userId);

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const {id} = request.params;

    const {likes, source} = await this._service.getAlbumLikesById(id);

    if (source === 'cache') {
      const response = h.response({
        status: 'success',
        message: 'Album likes fetched',
        data: {
          likes,
        },
      });
      response.header('X-Data-Source', 'cache');
      return response;
    }

    return {
      status: 'success',
      message: 'Album likes fetched',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumsHandler;
