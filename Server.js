import TcpSocket from 'react-native-tcp-socket';
import { ToastAndroid } from 'react-native';
import { totalRecordsStored } from './Navbar/Files';
import { viewData, insertTable, deleteRowsByIds  } from './Database';

let server = null;
export let didServerStarted = false;

export const ServerConnection = (ipAddress) => {
    const connectionDetails = {
        host: ipAddress,
        port: 3001
    };

    server = TcpSocket.createServer(function (socket) {
        console.log('Enabling Server Connection');
        didServerStarted = true;
        let completeData = '';
        console.log(socket);

        socket.on('data', async (data) => {
            try {
              console.log('Server', data.length);
              completeData += data.toString();
              if (completeData.endsWith('END_OF_DATA')) {
                    completeData = completeData.replace('END_OF_DATA', '');

                    if (completeData[0] == '[' && !completeData.endsWith('Delete')) {
                         completeData = JSON.parse(completeData)[0];
                    }


                    if (typeof completeData == 'string' && completeData.endsWith('Delete')) {
                        completeData = completeData.replace('Delete', '');
                        completeData = JSON.parse(completeData);
                        deleteRowsByIds(completeData);
                    }
                    else if (typeof completeData == 'object' ) {
                        console.log('Inserting');
                        let fileData = completeData.file_data;
                        let fileName = completeData.fileName;
                        let fileType = completeData.fileType;
                        insertTable(fileData, fileName, fileType);
                    }

                    let result = await viewData();
                    const mdata = JSON.stringify(result);


                    socket.write(mdata);
                    socket.write('END_OF_DATA');
                    completeData = '';
              }
            } catch(err) {
              console.log(err);
            }
        });

        socket.on('error', (error) => {
           console.log('An error ocurred with client socket ', error);
        });

        socket.on('close', (error) => {
          console.log('Closed connection with ', error);
        });
    }).listen( connectionDetails, () => {
        ToastAndroid.show('Listening on port ' + connectionDetails.port, ToastAndroid.SHORT);
    });

    server.on('error', (error) => {
      console.log('An error ocurred with the server', error);
    });

    server.on('close', () => {
      console.log('Server closed connection');
    });
};

export const stopServer = () => {
  didServerStarted = false;
  if (server) {
    server.close((error) => {
      if (error) {
        console.log('An error occurred while stopping the server', error);
      } else {
        ToastAndroid.show('Server Stopped', ToastAndroid.SHORT);
      }
    });
  }
};