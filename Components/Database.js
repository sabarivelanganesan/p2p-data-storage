import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase(
    {
        name: 'MyDatabase'
    },
    () => {
        console.log('Database opened Successfully');
        createTable();
        createFileChunkTable();
//        clearTable();
    },
    (err) => {
        console.log('Failed to open database', err)
    }
);
const chunkSize = 850 * 850;

const createTable = () => {
    db.transaction(txn => {
        txn.executeSql(
        `CREATE TABLE IF NOT EXISTS Files (
        file_id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_data BLOB,
        file_name VARCHAR,
        file_type VARCHAR
        )`,

        [],
        (sqlTxn, res) => {
            console.log('Files Table Created Successfully');
        },
        error => {
            console.log('Error on creating table', error.message);
        }
        )
    })
 }

const createFileChunkTable = () => {
    db.transaction(txn => {
        txn.executeSql(
        ` CREATE TABLE IF NOT EXISTS FileChunks (
            chunk_id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER,
            chunk_order INTEGER,
            chunk_data BLOB,
            FOREIGN KEY (file_id) REFERENCES Files(file_id)
          );`,
        [],
        (sqlTxn, res) => {
            console.log('File Chunk Table Created Successfully');
        },
        error => {
            console.log('Error on creating table', error.message);
        }
        )
    })
 }


 const insertTable = (fileData, fileName, fileType) => {
    db.transaction(txn => {
        txn.executeSql(
        `INSERT INTO Files (file_name, file_type) VALUES (?, ?)`,
        [fileName, fileType],
        (sqlTxn, res) => {
//            console.log('FileData: ', res);
//            console.log('FileName: ', fileName);
//            console.log('FileType: ', fileType);
        const fileId = res.insertId;
        const totalChunks = Math.ceil(fileData.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(fileData.length, start + chunkSize);
          const chunkData = fileData.substring(start, end);

          txn.executeSql(
            `INSERT INTO FileChunks (file_id, chunk_order, chunk_data) VALUES (?, ?, ?)`,
            [fileId, i, chunkData],
            () => {},
            error => {
              console.log('Error on Inserting Chunk', error.message);
            }
          );
        }
            console.log(`File Data Storage added Successfully`);
        },
        error => {
            console.log('Error on Inserting Tables', error.message);
        })
    })
 };

 const viewData = () => {
     return new Promise((resolve, reject) => {
         db.transaction((tx) => {
           tx.executeSql(
             'SELECT file_id, file_name, file_type FROM Files',
             [],
             async (_, result) => {
               const rows = result.rows;
               const records = [];

               for (let index=0; index<rows.length; index++) {
                 const item = rows.item(index);
                 let { file_id, file_name, file_type } = item;

                 let chunks = [];
                 try {
                   chunks = await fetchChunksForFile(file_id);
                 } catch (error) {
                   console.log('Error fetching chunks for file', file_id, error);
                 }

                 records.push({ file_id, chunks, file_name, file_type });
               }
               resolve(records)
             },
             (_, error) => {
               reject(error);
             }
           );
         });
     });
 }

 const fetchChunksForFile = (fileId) => {
   return new Promise((resolve, reject) => {
     const chunks = [];

     db.transaction(txn => {
       txn.executeSql(
         `SELECT * FROM FileChunks WHERE file_id = ? ORDER BY chunk_order ASC`,
         [fileId],
         (sqlTxn, results) => {
           const rows = results.rows.raw();

           rows.forEach(row => {
             chunks.push(row);
           });

           resolve(chunks);
         },
         error => {
           console.log('Error on Fetching Chunks', error.message);
           reject(error);
         }
       );
     });
   });
 };

 const deleteRowsByIds = (idsArray) => {
  if (!idsArray || idsArray.length === 0) {
    console.log('No IDs provided for deletion.');
    return;
  }

  const idsString = idsArray.join(', ');
  console.log(typeof idsString);
  console.log(idsString);

  db.transaction((txn) => {
    txn.executeSql(
      `DELETE FROM Files WHERE file_id IN (${idsString})`,
      [],
      (sqlTxn, res) => {
        console.log('Rows deleted successfully');
      },
      (error) => {
        console.log('Error on deleting rows:', error.message);
      }
    );

    txn.executeSql(
    `DELETE FROM FileChunks WHERE file_id IN (${idsString})`,
    [],
    (sqlTxn, res) => {
    console.log('Associated chunks deleted successfully');
    },
    (error) => {
    console.log('Error on deleting associated chunks:', error.message);
    });
  });
};

const clearTable = () => {
  db.transaction((txn) => {
    txn.executeSql(
      'DROP TABLE IF EXISTS Files',
      [],
      (_, result) => {
        console.log('Table cleared successfully');
      },
      (_, error) => {
        console.log('Error clearing table:', error);
      }
    );
  });
}

const clearFileChunksTable = () => {
  db.transaction(txn => {
    txn.executeSql(
      `DROP TABLE IF EXISTS FileChunks;`,
      [],
      (sqlTxn, res) => {
        console.log('Table FileChunks has been dropped.');
      },
      (txn, error) => {
        console.log('Error when dropping table:', error);
      }
    );
  });
};

const createTableForServerDetails = () => {
    db.transaction(txn => {
        txn.executeSql(
        `CREATE TABLE IF NOT EXISTS ServerDetails (
        server_name VARCHAR PRIMARY KEY,
        ip_address VARCHAR,
        port INTEGER)`,
        [],
        (sqlTxn, res) => {
            console.log('Table Created for Server Details Successfully');
        },
        error => {
            console.log('Error on creating table Server Details', error.message);
        }
        )
    });
}

const insertTableForServerDetails = (serverName, ipAddress, portNumber) => {
    db.transaction(txn => {
        txn.executeSql(
        `INSERT INTO ServerDetails (server_name, ip_address, port) VALUES (?, ?)`,
        [serverName, ipAddress, portNumber],
        (sqlTxn, res) => {
            console.log('serverName: ', serverName);
            console.log('ipAddress: ', ipAddress);
            console.log('port: ', portNumber);
            console.log('File Data Storage added Successfully for Server Data');
        },
        error => {
            console.log('Error on Inserting Server Details Tables', error.message);
        }
        )
    })
};

const viewDataForServerDetails = () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT server_name, ip_address, port FROM ServerDetails',
            [],
            (_, result) => {
              const rows = result.rows;
              console.log(rows);
              const records = [];
              for (let index=0; index<rows.length; index++) {
                const item = rows.item(index);
                let { server_name, ip_address, port } = item;
                records.push({ server_name, ip_address, port });
              }
              console.log('From Database', records);
              resolve(records)
            },
            (_, error) => {
              reject(error);
            }
          );
        });
    });
}

export {
    openDatabase,
    insertTable,
    viewData,
    deleteRowsByIds,
    createTableForServerDetails,
    insertTableForServerDetails,
    viewDataForServerDetails,
    fetchChunksForFile
    };
