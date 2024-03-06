import TcpSocket from 'react-native-tcp-socket';
import { serverDetails } from './PeersConnectionSteps/ConnectWithDevice';
import { ToastAndroid } from 'react-native';

var cachedServerData = ``;
var count = 0;
const options = {
  port: serverDetails.port,
  host: serverDetails.ipAddress,
   interface: "wifi"
};
var client = TcpSocket.createConnection(options);
var isStillInprogress = false;
const CHUNK_SIZE = 1034*1034; // 16KB
const DELAY_BETWEEN_CHUNKS = 10; // 10 milliseconds; Adjust as needed

export const createClientConnection = () => {
  return new Promise((resolve, reject) => {
    client = TcpSocket.createConnection(options);
    client.on('connect', () => {
      console.log('Connected to', options.host);
      resolve(); // Resolve the promise when the connection is established
    });

    client.on('error', (error) => {
      reject(error); // Reject the promise if there is an error
    });
  });
};

export const sendMessageToServer = (message) => {
  return new Promise((resolve, reject) => {
    console.log('Requesting to', options.host);
//    console.log('client -> ', client);
    let cachedServerData = '';

    if (typeof message !== 'string') {
      console.log('Converting to String');
      message = JSON.stringify(message);
    }

    const sendChunk = (startIndex) => {
      if (startIndex >= message.length) {
        client.write('END_OF_DATA');
        return;
      }

      const chunk = message.substring(startIndex, startIndex + CHUNK_SIZE);
      client.write(chunk);

      setTimeout(() => {
        sendChunk(startIndex + CHUNK_SIZE);
      }, DELAY_BETWEEN_CHUNKS);
    };

    sendChunk(0);

//    client.write(message);
//    client.write('END_OF_DATA');

    client.on('data', (data) => {

      cachedServerData += data.toString();

      if (cachedServerData.endsWith('END_OF_DATA')) {
        cachedServerData = cachedServerData.replace('END_OF_DATA', '');
        console.log(cachedServerData);
        resolve(JSON.parse(cachedServerData)); // Resolve the promise with the received data
        client.removeAllListeners('data'); // Remove the data listener
      }
    });

  });
};

export const closeClientConnection = () => {
  client.end();
};

client.on('end', () => {
    console.log('Received All');
    ToastAndroid.show('Done Received', ToastAndroid.LONG);
})

client.on('error', (error) => {
  console.log('Error -> :', error);
});


export { cachedServerData, isStillInprogress };