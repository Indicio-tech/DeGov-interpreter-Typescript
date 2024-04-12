import {IndyVdrPoolConfig} from '@aries-framework/indy-vdr';
import genesisFile from './genesis-file';

const config: IndyVdrPoolConfig = {
  genesisTransactions: genesisFile,
  isProduction: false,
  indyNamespace: 'bcovrin',
  connectOnStartup: true,
};

export default config;
