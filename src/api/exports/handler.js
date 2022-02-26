class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const {id: credentialId} = request.auth.credentials;
    const {playlistId} = request.params;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage(`export:${playlistId}`, message);

    const response = h.response({
      status: 'success',
      message: 'Playlist export requested',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
