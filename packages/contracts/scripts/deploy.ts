import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SimpleStorage contract...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy SimpleStorage
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();
  console.log("✅ SimpleStorage deployed to:", address);

  // Verify deployment by calling retrieve
  const value = await simpleStorage.retrieve();
  console.log("📊 Initial stored value:", value.toString());

  // Test storing a value
  console.log("🔄 Testing store function...");
  const tx = await simpleStorage.store(42);
  await tx.wait();

  const newValue = await simpleStorage.retrieve();
  console.log("✅ New stored value:", newValue.toString());

  return {
    simpleStorage: address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
