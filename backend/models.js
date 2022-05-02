const { Sequelize, Op, QueryTypes }= require('sequelize');
const schemas = require('./schemas');

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: DB_HOST,
    port: 3306,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    logging: false,
});


const Region = sequelize.define("Region", schemas.RegionSchema, {
    timestamps: false,
});

const User = sequelize.define("User", schemas.UserSchema);

const ReLibrary = sequelize.define("ReLibrary", schemas.ReLibrarySchema, {
    timestamps: false,
});

const SmLibrary = sequelize.define("SmLibrary", schemas.SmLibrarySchema, {
    timestamps: false,
});

const Book = sequelize.define("Book", schemas.BookSchema, {
    timestamps: false,
});

const BookReservation = sequelize.define("BookReservation", schemas.BookReservationSchema);

const ReservedBook = sequelize.define("ReservedBook", schemas.ReservedBookSchema, {
    timestamps: false,
    engine: 'MYISAM'
});

const SmLibraryBook = sequelize.define("SmLibraryBook", schemas.SmLibraryBookSchema, {
    timestamps: false,
    engine: 'MYISAM'
});

const SimilarBook = sequelize.define("SimilarBook", schemas.SimilarBookSchema, {
    timestamps: false,
    engine: 'MYISAM',
    charset: 'utf8'
});

Region.hasMany(SmLibrary, {
    foreignKey: 'region'
});
SmLibrary.belongsTo(Region, {
    foreignKey: 'region'
});

Book.hasMany(SmLibraryBook, {
    foreignKey: 'ISBN'
});
SmLibraryBook.belongsTo(Book, {
    foreignKey: 'ISBN'
});

SmLibrary.hasMany(SmLibraryBook, {
    foreignKey: 'smtLibraryId'
});
SmLibraryBook.belongsTo(SmLibrary, {
    foreignKey: 'smtLibraryId'
});

ReLibrary.hasMany(SmLibraryBook, {
    foreignKey: 'reLibraryId'
});
SmLibraryBook.belongsTo(ReLibrary, {
    foreignKey: 'reLibraryId'
});

SmLibrary.hasMany(BookReservation, {
    foreignKey: 'smLibraryId'
});
BookReservation.belongsTo(SmLibrary, {
    foreignKey: 'smLibraryId'
});

User.hasMany(BookReservation, {
    foreignKey: 'userId'
});
BookReservation.belongsTo(User, {
    foreignKey: 'userId'
});

BookReservation.hasMany(ReservedBook, {
    foreignKey: 'BookReservationId'
});
ReservedBook.belongsTo(BookReservation, {
    foreignKey: 'BookReservationId'
});

Book.hasMany(SimilarBook,{
    foreignKey: 'targetBookISBN'
});
SimilarBook.belongsTo(Book, {
    foreignKey: 'targetBookISBN'
});
Book.hasMany(SimilarBook,{
    foreignKey: 'similarBookISBN'
});
SimilarBook.belongsTo(Book, {
    foreignKey: 'similarBookISBN'
});

module.exports = {
    Sequelize,
    Op,
    QueryTypes,
    sequelize,
    Region,
    User,
    ReLibrary,
    SmLibrary,
    Book,
    BookReservation,
    ReservedBook,
    SmLibraryBook,
    SimilarBook
};