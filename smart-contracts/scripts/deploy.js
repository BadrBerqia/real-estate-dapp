const hre = require("hardhat");

async function main() {
  console.log("=".repeat(50));
  console.log("Deploying RealEstateRental to", hre.network.name, "...");
  console.log("=".repeat(50));

  const RealEstateRental = await hre.ethers.getContractFactory("RealEstateRental");
  const contract = await RealEstateRental.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("\n✅ RealEstateRental deployed successfully!");
  console.log("📍 Contract address:", address);
  
  if (hre.network.name === "sepolia") {
    console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + address);
  }
  
  console.log("\n⚠️  IMPORTANT: Update the contract address in:");
  console.log("   - frontend/src/app/services/blockchain.service.ts");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });