const { DataTypes } = require('sequelize');

module.exports.RegionSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
};

module.exports.UserSchema = {
    id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    password: { //암호화!
        type: DataTypes.STRING(16),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    sex: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    region: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Regions',
            key: 'id',   
        },
    }
};

module.exports.ReLibrarySchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.FLOAT(9, 6),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT(9, 6),
        allowNull: false, 
    },
    region: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Regions',
            key: 'id',
        },
    },/*
    address: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    tel: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    closed: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    operatingTime: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    homepage: {
        type: DataTypes.STRING(40),
        allowNull: true,
    }*/
};

module.exports.SmLibrarySchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    latitude: {
        type: DataTypes.FLOAT(9, 6),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT(9, 6),
        allowNull: false, 
    },
    region: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Regions',
            key: 'id',
        },
    },
    maxNumOfBooks: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
};

module.exports.BookSchema = {
    ISBN: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    bookName: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    authors: {
        type: DataTypes.STRING(40),
        allowNull: true,
    },
    publisher: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    bookImageURL: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
    },
    publicationYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    classNo: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    loanCnt: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports.SmLibraryBookSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ISBN: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Books',
            key: 'ISBN',
        },
    },
    smtLibraryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SmLibraries',
            key: 'id',
        },
    },
    reLibraryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ReLibraries',
            key: 'id',
        },
    },
    placedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    lastLoanedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    loanCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
};

module.exports.BookReservationSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    smLibraryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SmLibraries',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.STRING,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
};

module.exports.ReservedBookSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    BookReservationId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'BookReservations',
            key: 'id',
        },
    },
    ISBN: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Books',
            key: 'ISBN',
        },
    },
    bookName: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
};

module.exports.SimilarBookSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    targetBookISBN: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Books',
            key: 'ISBN',
        },
    },
    similarBookISBN: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Books',
            key: 'ISBN',
        },
    },
    ranking: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
};