class CollaborationsHandler {
  #collaborationsService;
  #playlistsService;
  #validator;

  constructor(collaborationsService, playlistsService, validator) {
    this.#collaborationsService = collaborationsService;
    this.#playlistsService = playlistsService;
    this.#validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    this.#validator.validateCollaborationPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this.#playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this.#collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration added',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this.#validator.validateCollaborationPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this.#playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.#collaborationsService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration removed',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
