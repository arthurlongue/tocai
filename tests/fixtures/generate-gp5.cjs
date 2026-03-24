// Generate a minimal valid Guitar Pro 5 file for testing
// GP5 format: 44 bytes header + song data

const fs = require('fs');
const path = require('path');

function createMinimalGP5() {
  const buffer = Buffer.alloc(4096);
  let offset = 0;

  // GP5 Header (44 bytes)
  // Magic number: "FICHIER GUITAR PRO v5.00" (28 bytes)
  const magic = 'FICHIER GUITAR PRO v5.00';
  buffer.write(magic, offset, 'utf8');
  offset += 28;

  // Version info (4 bytes): 5.0.0 = 0x05000000 in little-endian
  buffer.writeUInt32LE(0x05000000, offset);
  offset += 4;

  // Song name (32 bytes, null-padded)
  buffer.write('Test Song', offset, 'utf8');
  offset += 32;

  // Rest of header (zeros for minimal file)
  // This includes: artist, album, copyright, etc.
  // We'll leave them as zeros

  // Skip to offset 256 for track info
  offset = 256;

  // Number of tracks (4 bytes)
  buffer.writeUInt32LE(1, offset);
  offset += 4;

  // Track 1 header
  // Track name (40 bytes)
  buffer.write('Test Guitar', offset, 'utf8');
  offset += 40;

  // Number of strings (4 bytes) - 6 strings
  buffer.writeUInt32LE(6, offset);
  offset += 4;

  // String tunings (6 * 4 = 24 bytes) - E2, A2, D3, G3, B3, E4
  const tunings = [40, 45, 50, 55, 59, 64]; // MIDI note numbers
  for (const tuning of tunings) {
    buffer.writeUInt32LE(tuning, offset);
    offset += 4;
  }

  // Number of bars (4 bytes) - 1 bar
  buffer.writeUInt32LE(1, offset);
  offset += 4;

  // Time signature (8 bytes): 4/4
  buffer.writeUInt32LE(4, offset); // numerator
  offset += 4;
  buffer.writeUInt32LE(4, offset); // denominator
  offset += 4;

  // Tempo (4 bytes) - 120 BPM
  buffer.writeUInt32LE(120, offset);
  offset += 4;

  // Add minimal bar/beat data
  // Bar header (simplified)
  buffer.writeUInt32LE(1, offset); // 1 beat in bar
  offset += 4;

  // Beat data
  buffer.writeUInt32LE(1, offset); // quarter note duration
  offset += 4;

  // Note on string 6 (high E), fret 0 (open)
  buffer.writeUInt32LE(6, offset); // string number (1-based)
  offset += 4;
  buffer.writeUInt32LE(0, offset); // fret
  offset += 4;

  // End of file marker
  buffer.writeUInt32LE(0, offset);

  return buffer.slice(0, offset + 4);
}

const gp5Buffer = createMinimalGP5();
const fixturesDir = path.join(__dirname, '..', 'fixtures');

// Ensure fixtures directory exists
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Write the GP5 file
const gp5Path = path.join(fixturesDir, 'test-song.gp5');
fs.writeFileSync(gp5Path, gp5Buffer);

console.log(`Created minimal GP5 test fixture: ${gp5Path}`);
console.log(`File size: ${gp5Buffer.length} bytes`);
