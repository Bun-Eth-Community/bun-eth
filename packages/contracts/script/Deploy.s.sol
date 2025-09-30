// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract DeployScript is Script {
    function run() external returns (SimpleStorage) {
        console.log("Deploying SimpleStorage contract...");
        console.log("Deploying with account:", msg.sender);

        vm.startBroadcast();

        SimpleStorage simpleStorage = new SimpleStorage();
        console.log("SimpleStorage deployed to:", address(simpleStorage));

        // Verify deployment
        uint256 value = simpleStorage.retrieve();
        console.log("Initial stored value:", value);

        // Test storing a value
        console.log("Testing store function...");
        simpleStorage.store(42);

        uint256 newValue = simpleStorage.retrieve();
        console.log("New stored value:", newValue);

        vm.stopBroadcast();

        return simpleStorage;
    }
}
