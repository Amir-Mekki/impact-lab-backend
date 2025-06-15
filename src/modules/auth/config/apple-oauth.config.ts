import { registerAs } from '@nestjs/config';
import * as fs from 'fs';

export default registerAs('appleOAuth', () => {
  let privateKeyString = '';
  const keyPath = './AuthKey.p8';
  if (fs.existsSync(keyPath)) {
    privateKeyString = fs.readFileSync(keyPath).toString();
  }
  return {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    callbackURL: process.env.APPLE_CALLBACK_URL,
    privateKeyString,
  };
});
