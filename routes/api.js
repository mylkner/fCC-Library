/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongoose = require("mongoose");
const Book = require("../Schemas/bookSchema.js");

mongoose.connect(process.env.MONGO_DB);

module.exports = function (app) {
    app.route("/api/books")
        .get(async function (req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
            const books = await Book.find();
            const response = books.map((book) => {
                return {
                    _id: book._id,
                    title: book.title,
                    comments: book.comments,
                    commentcount: book.comments.length,
                };
            });
            res.json(response);
        })

        .post(async function (req, res) {
            let title = req.body.title;
            //response will contain new book object including atleast _id and title

            if (!title) {
                res.json("missing required field title");
                return;
            }

            const newBook = await Book.create({
                title: title,
            });
            res.json({
                _id: newBook._id,
                title: newBook.title,
            });
        })

        .delete(async function (req, res) {
            //if successful response will be 'complete delete successful'
            await Book.deleteMany();
            res.json("complete delete successful");
        });

    app.route("/api/books/:id")
        .get(async function (req, res) {
            let bookid = req.params.id;
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

            try {
                const book = await Book.findById(bookid);
                res.json({
                    _id: book._id,
                    title: book.title,
                    comments: book.comments,
                });
            } catch {
                res.json("no book exists");
            }
        })

        .post(async function (req, res) {
            let bookid = req.params.id;
            let comment = req.body.comment;

            if (!comment) {
                res.json("missing required field comment");
                return;
            }

            try {
                await Book.findById(bookid);
                const updatedBook = await Book.findByIdAndUpdate(
                    bookid,
                    { $push: { comments: comment } },
                    { runValidators: true, new: true }
                );

                res.json({
                    _id: updatedBook._id,
                    title: updatedBook.title,
                    comments: updatedBook.comments,
                });
            } catch {
                res.json("no book exists");
            }
        })

        .delete(async function (req, res) {
            let bookid = req.params.id;
            //if successful response will be 'delete successful'
            try {
                const bookToDelete = await Book.findByIdAndDelete(bookid);

                if (!bookToDelete) {
                    throw new Error();
                }

                res.json("delete successful");
            } catch {
                res.json("no book exists");
            }
        });
};
