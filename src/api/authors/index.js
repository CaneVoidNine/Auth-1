import express from "express";
import AuthorsModel from "./model.js";

import createHttpError from "http-errors";
const authorsRouter = express.Router();

// POST

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// GET

authorsRouter.get("/", async (req, res, next) => {
  try {
    const Authors = await AuthorsModel.find();
    res.send(Authors);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const Author = await AuthorsModel.findById(req.params.authorId);
    if (Author) {
      res.send(Author);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.AuthorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
