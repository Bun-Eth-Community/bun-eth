// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;
    address public user = address(0x1);

    function setUp() public {
        simpleStorage = new SimpleStorage();
    }

    function test_InitialValue() public view {
        assertEq(simpleStorage.retrieve(), 0);
    }

    function test_Store() public {
        simpleStorage.store(42);
        assertEq(simpleStorage.retrieve(), 42);
    }

    function test_StoreEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit SimpleStorage.ValueChanged(0, 42, address(this));
        simpleStorage.store(42);
    }

    function test_UpdateStoredValue() public {
        simpleStorage.store(42);
        simpleStorage.store(100);
        assertEq(simpleStorage.retrieve(), 100);
    }

    function test_Increment() public {
        simpleStorage.store(5);
        simpleStorage.increment();
        assertEq(simpleStorage.retrieve(), 6);
    }

    function test_IncrementFromZero() public {
        simpleStorage.increment();
        assertEq(simpleStorage.retrieve(), 1);
    }

    function test_IncrementEmitsEvent() public {
        simpleStorage.store(10);
        vm.expectEmit(true, true, true, true);
        emit SimpleStorage.ValueChanged(10, 11, address(this));
        simpleStorage.increment();
    }

    function testFuzz_Store(uint256 value) public {
        simpleStorage.store(value);
        assertEq(simpleStorage.retrieve(), value);
    }
}
