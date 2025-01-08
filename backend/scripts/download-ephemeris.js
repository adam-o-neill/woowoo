const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REQUIRED_FILES = [
  "seas_18.se1", // Main asteroid file
  "semo_18.se1", // Moon
  "sepl_18.se1", // Planets
];

async function downloadEphemeris() {
  try {
    const ephePath = path.join(__dirname, "../ephemeris_files");

    if (!fs.existsSync(ephePath)) {
      fs.mkdirSync(ephePath, { recursive: true });
    }

    console.log("Downloading ephemeris files...");
    execSync(
      "curl -L https://github.com/aloistr/swisseph/archive/refs/heads/master.zip -o swisseph.zip"
    );

    console.log("Extracting required files...");
    execSync(
      `unzip -j -o swisseph.zip ${REQUIRED_FILES.map(
        (f) => `swisseph-master/ephe/${f}`
      ).join(" ")} -d ${ephePath}`
    );

    console.log("Cleanup...");
    fs.unlinkSync("swisseph.zip");

    console.log("Ephemeris files installed successfully!");
  } catch (error) {
    console.error("Error installing ephemeris files:", error);
    process.exit(1);
  }
}

downloadEphemeris();
