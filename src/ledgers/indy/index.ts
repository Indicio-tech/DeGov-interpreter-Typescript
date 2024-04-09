import BCovrinTestNet from "./BCovrin-test-net/pool-config"
import IndicioDemoNet from "./indicio-demo-net/pool-config"
import IndicioMainNet from "./indicio-main-net/pool-config"
import IndicioTestNet from "./indicio-test-net/pool-config"
import SovrinMainNet from "./sovrin-main-net/pool-config"
import { IndyVdrPoolConfig } from "@aries-framework/indy-vdr"

const ledgers: [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]] = [
  // BCovrinTestNet,
  IndicioMainNet,
  IndicioDemoNet,
  IndicioTestNet,
  // SovrinMainNet,
]

export default ledgers
