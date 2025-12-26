const hre = require("hardhat");

async function main() {
  console.log("Deploying RentalEscrow to", hre.network.name, "...");
  
  const RentalEscrow = await hre.ethers.getContractFactory("RentalEscrow");
  const contract = await RentalEscrow.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("RentalEscrow deployed to:", address);
  
  // Affiche le lien Etherscan pour Sepolia
  if (hre.network.name === "sepolia") {
    console.log("View on Etherscan: https://sepolia.etherscan.io/address/" + address);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });