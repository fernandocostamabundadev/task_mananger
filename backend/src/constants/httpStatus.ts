export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const httpStatus = {
  ok: HttpStatus.OK,
  created: HttpStatus.CREATED,
  noContent: HttpStatus.NO_CONTENT,
  badRequest: HttpStatus.BAD_REQUEST,
  notFound: HttpStatus.NOT_FOUND,
  internalServerError: HttpStatus.INTERNAL_SERVER_ERROR,
};
