class UsersHandler {
  #service;
  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this.#validator.validateUserPayload(request.payload);
    const {username, password, fullname} = request.payload;

    const userId = await this.#service.addUser({
      username,
      password,
      fullname});

    const response = h.response({
      status: 'success',
      message: 'User added',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const {id} = request.params;
    const user = await this.#service.getUserById(id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

module.exports = UsersHandler;
