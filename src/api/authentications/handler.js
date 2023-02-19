class AuthenticationsHandler {
  #authenticationsService;
  #usersService;
  #tokenManager;
  #validator;

  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.#authenticationsService = authenticationsService;
    this.#usersService = usersService;
    this.#tokenManager = tokenManager;
    this.#validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this.#validator.validatePostAuthenticationPayload(request.payload);

    const {username, password} = request.payload;
    const id = await this.#usersService.verifyUserCredential(username, password);

    const accessToken = this.#tokenManager.generateAccessToken({id});
    const refreshToken = this.#tokenManager.generateRefreshToken({id});

    await this.#authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication added',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this.#validator.validatePutAuthenticationPayload(request.payload);

    const {refreshToken} = request.payload;
    await this.#authenticationsService.verifyRefreshToken(refreshToken);
    const {id} = this.#tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this.#tokenManager.generateAccessToken({id});

    return {
      status: 'success',
      message: 'Access token updated',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    this.#validator.validateDeleteAuthenticationPayload(request.payload);

    const {refreshToken} = request.payload;
    await this.#authenticationsService.verifyRefreshToken(refreshToken);
    await this.#authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token deleted',
    };
  }
}

module.exports = AuthenticationsHandler;
