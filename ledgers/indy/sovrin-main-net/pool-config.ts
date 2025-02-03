import { IndyVdrPoolConfig } from "@aries-framework/indy-vdr"
import genesisFile from "./genesis-file"

const config: IndyVdrPoolConfig = {
  indyNamespace: "SovrinMainNet",
  genesisTransactions: genesisFile,
  isProduction: true,
  connectOnStartup: true,
}

export default config
