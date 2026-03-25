const fs = require("node:fs");
const path = require("node:path");

class Writer {
	constructor(size = 4096) {
		this.buf = Buffer.alloc(size);
		this.pos = 0;
	}

	byte(value = 0) {
		this.buf.writeUInt8(value & 0xff, this.pos);
		this.pos += 1;
	}

	signedByte(value = 0) {
		this.buf.writeInt8(value, this.pos);
		this.pos += 1;
	}

	boolean(value = false) {
		this.byte(value ? 1 : 0);
	}

	short(value = 0) {
		this.buf.writeInt16LE(value, this.pos);
		this.pos += 2;
	}

	int(value = 0) {
		this.buf.writeInt32LE(value, this.pos);
		this.pos += 4;
	}

	byteSizeString(value, fixedLength) {
		const bytes = Buffer.from(value, "latin1");
		this.byte(bytes.length);
		bytes.copy(this.buf, this.pos);
		this.pos += bytes.length;
		this.pos += Math.max(0, fixedLength - Math.min(bytes.length, fixedLength));
	}

	intByteSizeString(value = "") {
		const bytes = Buffer.from(value, "latin1");
		this.int(bytes.length + 1);
		this.byte(bytes.length);
		bytes.copy(this.buf, this.pos);
		this.pos += bytes.length;
	}

	intString(value = "") {
		const bytes = Buffer.from(value, "latin1");
		this.int(bytes.length);
		bytes.copy(this.buf, this.pos);
		this.pos += bytes.length;
	}

	save(filePath) {
		fs.writeFileSync(filePath, this.buf.subarray(0, this.pos));
	}
}

function createParserValidGp5() {
	const writer = new Writer();

	writer.byteSizeString("FICHIER GUITAR PRO v5.10", 30);

	for (const value of [
		"Test Song",
		"",
		"Test Artist",
		"",
		"",
		"",
		"",
		"",
		"",
	]) {
		writer.intByteSizeString(value);
	}

	writer.int(0);

	writer.int(0);
	for (let i = 0; i < 5; i++) {
		writer.int(0);
		writer.intString("");
	}

	writer.int(0);
	writer.int(0);
	for (let i = 0; i < 11; i++) {
		writer.signedByte(0);
	}

	for (let i = 0; i < 7; i++) {
		writer.int(0);
	}
	writer.short(0);
	for (let i = 0; i < 10; i++) {
		writer.intByteSizeString("");
	}

	writer.intByteSizeString("");
	writer.int(120);
	writer.boolean(false);
	writer.signedByte(0);
	writer.int(0);

	for (let i = 0; i < 64; i++) {
		writer.int(25);
		writer.byte(100);
		writer.byte(64);
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
	}

	for (let i = 0; i < 19; i++) {
		writer.short(0);
	}

	writer.int(0);
	writer.int(4);
	writer.int(1);

	writer.byte(0);
	writer.byte(0);
	writer.byte(0);
	for (let i = 0; i < 3; i++) {
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
		writer.byte(0);
	}

	writer.byte(0);
	writer.byte(0);
	writer.byteSizeString("Guitar", 40);
	writer.int(6);
	for (const tuning of [64, 59, 55, 50, 45, 40, 0]) {
		writer.int(tuning);
	}
	writer.int(1);
	writer.int(1);
	writer.int(2);
	writer.int(24);
	writer.int(0);
	writer.int(0);
	writer.short(0);
	writer.byte(0);
	writer.byte(0);

	writer.byte(0);
	for (let i = 0; i < 24; i++) {
		writer.byte(0);
	}
	for (let i = 0; i < 4; i++) {
		writer.int(0);
	}
	for (let i = 0; i < 4; i++) {
		writer.signedByte(0);
	}
	writer.intByteSizeString("");
	writer.intByteSizeString("");
	writer.byte(0);

	for (let i = 0; i < 4; i++) {
		writer.int(1);
		writer.byte(0);
		writer.signedByte(-2);
		writer.byte(64);
		writer.byte(0);
		writer.byte(0);
		writer.short(0);
		writer.int(0);
		writer.byte(0);
	}

	return writer;
}

const fixturesDir = path.join(__dirname, "..", "fixtures");
if (!fs.existsSync(fixturesDir)) {
	fs.mkdirSync(fixturesDir, { recursive: true });
}

const outputPath = path.join(fixturesDir, "test-song.gp5");
createParserValidGp5().save(outputPath);

const { size } = fs.statSync(outputPath);
console.log(`Created parser-valid GP5 test fixture: ${outputPath}`);
console.log(`File size: ${size} bytes`);
