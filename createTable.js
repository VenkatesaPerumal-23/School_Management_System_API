const db = require('./db');

const createTable = `
  CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
  );
`;

db.query(createTable, (err, result) => {
  if (err) {
    console.error("Error creating table:", err.message);
  } else {
    console.log("schools table created or already exists.");
  }
  process.exit();
});
