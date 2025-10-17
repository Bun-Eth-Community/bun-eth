// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract DeployScript is Script {
    function run() external returns (SimpleStorage) {
        console.log("");
        console.log("==================================");
        console.log("   STARTING DEPLOYMENT");
        console.log("==================================");
        console.log("");

        console.log("Configuration:");
        console.log("  Deployer:   %s", msg.sender);
        console.log("  Chain ID:   %s", block.chainid);
        console.log("  Block:      %s", block.number);
        console.log("");

        vm.startBroadcast();

        console.log("Deploying SimpleStorage contract...");
        SimpleStorage simpleStorage = new SimpleStorage();

        // Verify deployment
        uint256 value = simpleStorage.retrieve();
        console.log("Testing contract functions...");

        // Test storing a value
        simpleStorage.store(42);
        uint256 newValue = simpleStorage.retrieve();

        vm.stopBroadcast();

        console.log("");
        console.log("==================================");
        console.log("   DEPLOYMENT SUCCESSFUL");
        console.log("==================================");
        console.log("");

        console.log("Contract Address:");
        console.log("  SimpleStorage: %s", address(simpleStorage));
        console.log("");

        console.log("Verification:");
        console.log("  Initial value:  %s", value);
        console.log("  Test value:     %s", newValue);
        console.log("  Status:         %s", newValue == 42 ? "PASSED" : "FAILED");
        console.log("");

        console.log("Next Steps:");
        console.log("  1. Save contract address above");
        console.log("  2. Update frontend .env.local if needed");
        console.log("  3. Contract types will auto-generate");
        console.log("  4. Frontend will hot reload");
        console.log("");

        if (block.chainid != 31_337) {
            console.log("Testnet Deployment:");
            console.log("  Verify on Etherscan:");
            console.log("  forge verify-contract %s SimpleStorage --chain-id %s", address(simpleStorage), block.chainid);
            console.log("");
        }

        return simpleStorage;
    }
}
