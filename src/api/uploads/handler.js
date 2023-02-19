class UploadsHandler {
  #storageService;
  #albumsService;
  #validator;

  constructor(storageService, albumsService, validator) {
    this.#storageService = storageService;
    this.#albumsService = albumsService;
    this.#validator = validator;

    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this);
  }

  async postAlbumCoverByIdHandler(request, h) {
    const {id} = request.params;
    const {cover} = request.payload;

    this.#validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.#storageService.writeFile(cover, cover.hapi, id);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${filename}`;
    await this.#albumsService.addAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Album cover added',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
