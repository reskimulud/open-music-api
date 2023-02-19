class ExportsHandler {
  #producerService;
  #playlistService;
  #validator;

  constructor(producerService, playlistService, validator) {
    this.#producerService = producerService;
    this.#playlistService = playlistService;
    this.#validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this.#validator.validateExportPlaylistsPayload(request.payload);

    const {id: credentialId} = request.auth.credentials;
    const {playlistId} = request.params;

    await this.#playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.#producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Playlist export requested',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
