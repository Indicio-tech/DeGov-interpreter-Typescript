import genesisFile from "./genesis-file"
import { IndyVdrPoolConfig } from "@aries-framework/indy-vdr"

const config: IndyVdrPoolConfig = {
  genesisTransactions: genesisFile,
  isProduction: false,
  indyNamespace: "indicio-demo-net",
  connectOnStartup: true,
  transactionAuthorAgreement: {
    version: "1.3",
    acceptanceMechanism: "at_submission",
  },
}

export default config
