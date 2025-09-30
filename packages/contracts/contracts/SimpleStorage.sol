// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleStorage
 * @dev Store and retrieve a value
 */
contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue, address indexed changer);

    /**
     * @dev Store a new value
     * @param newValue The value to store
     */
    function store(uint256 newValue) public {
        uint256 oldValue = storedValue;
        storedValue = newValue;
        emit ValueChanged(oldValue, newValue, msg.sender);
    }

    /**
     * @dev Retrieve the stored value
     * @return The stored value
     */
    function retrieve() public view returns (uint256) {
        return storedValue;
    }

    /**
     * @dev Increment the stored value
     */
    function increment() public {
        uint256 oldValue = storedValue;
        storedValue += 1;
        emit ValueChanged(oldValue, storedValue, msg.sender);
    }
}
