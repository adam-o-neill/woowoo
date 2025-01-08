const fs = require("fs");
const path = require("path");

const REQUIRED_FILES = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"];

const ephePath = path.join(__dirname, "../ephemeris_files");

try {
  if (!fs.existsSync(ephePath)) {
    throw new Error("Ephemeris directory not found");
  }

  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(ephePath, file))) {
      throw new Error(`Required file ${file} not found`);
    }
  }

  console.log("All required ephemeris files present");
} catch (error) {
  console.error("Ephemeris check failed:", error);
  process.exit(1);
}
