#!/bin/bash
echo "Downloading Swiss Ephemeris files..."
wget https://www.astro.com/ftp/swisseph/se.zip
unzip se.zip -d ./ephemeris_files
echo "Swiss Ephemeris files downloaded and extracted."
