import osc from 'osc-min';
import dgram from 'dgram';

export {
  getOSCSettings,
  setOSCSettings,
} from './settings';

const udp = dgram.createSocket('udp4');

export const sendOSC = (OSCMessages, portNumber) => {
  OSCMessages.forEach((msg) => {
    const bufferMsg = osc.toBuffer(msg);
    udp.send(bufferMsg, 0, bufferMsg.length, portNumber, 'localhost');
  });
};
