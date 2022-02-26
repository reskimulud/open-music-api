class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postAlbumCoverByIdHandler(request, h) {
    const {id} = request.params;
    const {cover} = request.payload;

    this._validator.validateExportPlaylistsPayload(request.payload);

    const fileLocation = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumsService.addAlbumCoverById(id, fileLocation);
  }
}

module.exports = UploadsHandler;
