import createHttpError from "http-errors";
import atob from "atob";
import authorsModel from "../../authors/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  // This will be our "Police Officer Middleware", responsible for checking "documents" (credentials) of authors
  // If documents are ok, author can have the access to the endpoint
  // If they are not, author is going to be rejected with an error (401)
  // Here we are expecting to receive an Authorization header like "Basic cmFtYm9AZ21haWwuY29tOjEyMzQ="
  // "cmFtYm9AZ21haWwuY29tOjEyMzQ=" is basically just email:password encoded in Base64

  // 1. Check if Authorization header is provided, if it is not --> trigger an error (401)
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide credentials in the Authorization header!"
      )
    );
  } else {
    // 2. If we have the Authorization header, we should extract the credentials out of it
    const encodedCredentials = req.headers.authorization.split(" ")[1];

    // 3. Decode the credentials
    const credentials = atob(encodedCredentials); // atob converts "cmFtYm9AZ21haWwuY29tOjEyMzQ=" into "rambo@gmail.com:1234"

    const [email, password] = credentials.split(":");

    // 4. Once we have the credentials, let's check if the author is in db and if the provided pw is ok
    const author = await authorsModel.checkCredentials(email, password);
    if (author) {
      // 5.a If credentials are ok --> you can go on
      req.author = author;
      // Adding the current author to the req object is going to unlock a number of possibilities like using some subsequent middlewares to check the role of that author for instance (Authorization)
      next();
    } else {
      // 5.b If they are NOT ok --> 401
      next(createHttpError(401, "Credentials not ok!"));
    }
  }
};
