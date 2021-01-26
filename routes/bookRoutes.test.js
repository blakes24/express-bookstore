process.env.NODE_ENV === 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

let b;
describe('Book Routes Test', function() {
	beforeEach(async function() {
		await db.query('DELETE FROM books');

		b = await Book.create({
			isbn       : '0691161518',
			amazon_url : 'http://a.co/eobPtX2',
			author     : 'Matthew Lane',
			language   : 'english',
			pages      : 264,
			publisher  : 'Princeton University Press',
			title      : 'Power-Up',
			year       : 2017
		});
	});

	describe('GET /books', function() {
		test('gets all books', async function() {
			let response = await request(app).get('/books');
			expect(response.body).toEqual({ books: [ b ] });
		});
	});

	describe('GET /books/:isbn', function() {
		test('gets a book by isbn', async function() {
			let response = await request(app).get(`/books/${b.isbn}`);
			expect(response.body).toEqual({ book: b });
		});

		test('throws error if book not found', async function() {
			let response = await request(app).get(`/books/2`);
			expect(response.status).toEqual(404);
		});
	});

	describe('POST /books', function() {
		test('can add a book', async function() {
			let b2 = {
				isbn       : '1234567',
				amazon_url : 'http://a.co/b2',
				author     : 'Someone',
				language   : 'english',
				pages      : 324,
				publisher  : 'Penguin',
				title      : 'Stuff',
				year       : 2009
			};
			let response = await request(app).post('/books').send(b2);
			expect(response.body).toEqual({ book: b2 });
		});

		test('throws error if duplicate isbn', async function() {
			let response = await request(app).post('/books').send({
				isbn       : '0691161518',
				amazon_url : 'http://a.co/b2',
				author     : 'Someone',
				language   : 'english',
				pages      : 324,
				publisher  : 'Penguin',
				title      : 'Stuff',
				year       : 2009
			});
			expect(response.statusCode).toEqual(400);
		});

		test('throws error if data is missing', async function() {
			let response = await request(app).post('/books').send({
				isbn       : '1234567',
				amazon_url : 'http://a.co/b2',
				author     : 'Someone'
			});
			expect(response.statusCode).toEqual(400);
		});

		test('throws error if data is invalid', async function() {
			let response = await request(app).post('/books').send({
				isbn       : '1234567',
				amazon_url : 'http://a.co/b2',
				author     : 78,
				language   : 'english',
				pages      : 324,
				publisher  : 'Penguin',
				title      : 'Stuff',
				year       : '2009'
			});
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('PUT /books/:isbn', function() {
		test('can update a book', async function() {
			let response = await request(app).put(`/books/${b.isbn}`).send({ title: 'New Title' });
			expect(response.body).toEqual({
				book : {
					isbn       : '0691161518',
					amazon_url : 'http://a.co/eobPtX2',
					author     : 'Matthew Lane',
					language   : 'english',
					pages      : 264,
					publisher  : 'Princeton University Press',
					title      : 'New Title',
					year       : 2017
				}
			});
		});

		test('throws error if data is invalid', async function() {
			let response = await request(app).put(`/books/${b.isbn}`).send({
				year : '2009'
			});
			expect(response.statusCode).toEqual(400);
		});

		test('throws error if book not found', async function() {
			let response = await request(app).put(`/books/3`).send({
				year : 2009
			});
			expect(response.statusCode).toEqual(404);
		});
	});

	describe('DELETE /books/:isbn', function() {
		test('can delete a book', async function() {
			let response = await request(app).delete(`/books/${b.isbn}`);
			expect(response.body).toEqual({
				message : 'Book deleted'
			});
		});

		test('throws error if book not found', async function() {
			let response = await request(app).delete(`/books/3`);
			expect(response.statusCode).toEqual(404);
		});
	});
});

afterAll(async function() {
	await db.end();
});
