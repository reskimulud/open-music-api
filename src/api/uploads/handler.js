class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this);
  }

  async postAlbumCoverByIdHandler(request, h) {
    const {id} = request.params;
    const {cover} = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi, id);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${filename}`;
    await this._albumsService.addAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Album cover added',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
