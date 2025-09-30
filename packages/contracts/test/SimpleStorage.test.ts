import { expect } from "chai";
import { ethers } from "hardhat";
import type { SimpleStorage } from "../typechain-types";

describe("SimpleStorage", function () {
  let simpleStorage: SimpleStorage;

  before(async function () {
    // Set working directory to contracts package
    process.chdir(__dirname + "/..");
  });

  beforeEach(async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = (await SimpleStorage.deploy()) as unknown as SimpleStorage;
    await simpleStorage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy with initial value of 0", async function () {
      expect(await simpleStorage.retrieve()).to.equal(0);
    });
  });

  describe("Store", function () {
    it("should store a value", async function () {
      await simpleStorage.store(42);
      expect(await simpleStorage.retrieve()).to.equal(42);
    });

    it("should emit ValueChanged event", async function () {
      const signers = await ethers.getSigners();
      await expect(simpleStorage.store(42))
        .to.emit(simpleStorage, "ValueChanged")
        .withArgs(0, 42, signers[0].address);
    });

    it("should update stored value", async function () {
      await simpleStorage.store(42);
      await simpleStorage.store(100);
      expect(await simpleStorage.retrieve()).to.equal(100);
    });
  });

  describe("Increment", function () {
    it("should increment the value", async function () {
      await simpleStorage.store(5);
      await simpleStorage.increment();
      expect(await simpleStorage.retrieve()).to.equal(6);
    });

    it("should increment from 0", async function () {
      await simpleStorage.increment();
      expect(await simpleStorage.retrieve()).to.equal(1);
    });

    it("should emit ValueChanged event on increment", async function () {
      const signers = await ethers.getSigners();
      await simpleStorage.store(10);
      await expect(simpleStorage.increment())
        .to.emit(simpleStorage, "ValueChanged")
        .withArgs(10, 11, signers[0].address);
    });
  });
});
