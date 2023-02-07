import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["author", "Admin"], default: "author" },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
authorsSchema.pre("save", async function (next) {
  // BEFORE saving the author in db, executes this custom function automagically
  // Here I am not using arrow functions as I normally do because of "this" keyword
  // (it would be undefined in case of arrow function, it is the current author in the case of a normal function)

  const currentauthor = this;

  if (currentauthor.isModified("password")) {
    // only if the author is modifying the pw (or if the author is being created) I would like to spend some precious CPU cycles on hashing the pw
    const plainPW = currentauthor.password;

    const hash = await bcrypt.hash(plainPW, 11);
    currentauthor.password = hash;
  }
  // When we are done with this function --> next
  next();
});

authorsSchema.methods.toJSON = function () {
  // This .toJSON method is used EVERY TIME Express does a res.send(author/s)
  // This does mean that we could override the default behaviour of this method to remove the passwords (and other unnecessary things as well) and then return the authors

  const authorDocument = this;
  const author = authorDocument.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  return author;
};

authorsSchema.static("checkCredentials", async function (email, password) {
  // My own custom method attached to the authorsModel

  // Given email and plain text password, this method has to check in the db if the author exists (by email)
  // Then it should compare the given password with the hashed one coming from the db
  // Then it should return an useful response

  // 1. Find by email
  const author = await this.findOne({ email }); //"this" here represents the author Model

  if (author) {
    // 2. If the author is found --> compare plain password with the hashed one
    const passwordMatch = await bcrypt.compare(password, author.password);

    if (passwordMatch) {
      // 3. If passwords they match --> return author

      return author;
    } else {
      // 4. If they don't --> return null
      return null;
    }
  } else {
    // 5. In case of author not found --> return null
    return null;
  }
});

// USAGE: const author = await authorModel.checkCredentials("rambo@gmail.com", "1234")
// if(author){// credentials are good}
// else { // credentials not good}

export default model("author", authorsSchema);
