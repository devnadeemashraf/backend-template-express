/**
 * DTO for Login with Username Use Case
 * This DTO is used to define the structure of the request data for the Login with Username use case.
 * It includes the username and password fields, which are required for authentication.
 * The DTO is used to ensure that the data passed to the use case is valid and complete.
 * It also helps to decouple the use case from the specific implementation of the request data,
 * allowing for easier testing and maintenance.
 *
 * The DTO can be extended or modified in the future without affecting the use case itself.
 *
 * This is particularly useful in a microservices architecture,
 * where different services may have different requirements for the request data.
 */
export interface ILoginWithUsernameUseCaseRequest {
  username: string;
  password: string;
}
