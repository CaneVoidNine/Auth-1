import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    content: { type: String, required: true },
    comments: [
      {
        name: { type: String, required: true },
        text: { type: String, required: true },
        commentDate: { type: Date, required: true },
      },
    ],
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  {
    timestamps: true,
  }
);

blogPostSchema.pre("save", async function (next) {
  // BEFORE saving the blog in db, executes this custom function automagically
  // Here I am not using arrow functions as I normally do because of "this" keyword
  // (it would be undefined in case of arrow function, it is the current blog in the case of a normal function)

  const currentblog = this;

  if (currentblog.isModified("password")) {
    // only if the blog is modifying the pw (or if the blog is being created) I would like to spend some precious CPU cycles on hashing the pw
    const plainPW = currentblog.password;

    const hash = await bcrypt.hash(plainPW, 11);
    currentblog.password = hash;
  }
  // When we are done with this function --> next
  next();
});

blogPostSchema.methods.toJSON = function () {
  // This .toJSON method is used EVERY TIME Express does a res.send(blog/s)
  // This does mean that we could override the default behaviour of this method to remove the passwords (and other unnecessary things as well) and then return the blogs

  const blogDocument = this;
  const blog = blogDocument.toObject();

  return blog;
};

blogPostSchema.static("checkCredentials", async function (email, password) {
  // My own custom method attached to the blogsModel

  // Given email and plain text password, this method has to check in the db if the blog exists (by email)
  // Then it should compare the given password with the hashed one coming from the db
  // Then it should return an useful response

  // 1. Find by email
  const blog = await this.findOne({ email }); //"this" here represents the blog Model

  if (blog) {
    // 2. If the blog is found --> compare plain password with the hashed one
    const passwordMatch = await bcrypt.compare(author, author.password);

    if (passwordMatch) {
      // 3. If passwords they match --> return blog

      return blog;
    } else {
      // 4. If they don't --> return null
      return null;
    }
  } else {
    // 5. In case of blog not found --> return null
    return null;
  }
});

// USAGE: const blog = await blogModel.checkCredentials("rambo@gmail.com", "1234")
// if(blog){// credentials are good}
// else { // credentials not good}

export default model("BlogPost", blogPostSchema);
