import {IndyVdrPoolConfig} from '@aries-framework/indy-vdr';
import genesisFile from './genesis-file';

const config: IndyVdrPoolConfig = {
  genesisTransactions: genesisFile,
  isProduction: true,
  indyNamespace: 'indicio-main-net',
  connectOnStartup: true,
};

export default config;
