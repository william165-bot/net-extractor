# Hermes Bytecode Disassembly Output

This directory contains the disassembled output from `index.android.bundle` (HBC version 96).

## Files

### Primary Disassembly Files

- **`bytecode_dump.txt`** (49MB) - Complete disassembled bytecode showing all functions, instructions, and opcodes in human-readable format. This is the main disassembly output.

- **`modules_dump.txt`** (622KB) - Module structure and dependencies extracted from the bundle.

- **`strings_dump.txt`** (2.8MB) - All string literals extracted from the bytecode using hermes_rs.

- **`objects_dump.txt`** (203KB) - Object structures and metadata from the bytecode.

- **`arrays_dump.txt`** (186 bytes) - Array definitions extracted from the bundle.

### Additional Analysis Files

- **`strings.txt`** (1.5MB) - Alternative string extraction using custom scanner (includes ASCII strings).

- **`bytecode.hex`** (464KB) - Hex dump of the first 100KB of the bundle for low-level analysis.

- **`hbc_info.json`** (148 bytes) - Metadata about the HBC file:
  ```json
  {
    "magic": "0x1f1903c103bc1fc6",
    "version": 96,
    "file_size": 8250568
  }
  ```

## Tools Used

1. **hermes_rs** (v0.1.13) - Rust-based Hermes bytecode disassembler supporting HBC v89-96
   - `bytecode` - Main disassembly tool
   - `strings` - String extraction
   - `modules` - Module analysis
   - `objects` - Object structure extraction
   - `arrays` - Array extraction

2. **Custom Python Extractor** - Additional string and hex dump extraction

## Original File

- **Source:** `index.android.bundle`
- **Size:** 7.9MB (8,250,568 bytes)
- **Type:** Hermes JavaScript bytecode, version 96
- **Magic:** 0x1f1903c103bc1fc6

## Usage

To reassemble the bytecode (if needed), you can use:
```bash
# Note: Reassembly from hermes_rs output is not directly supported yet
# You would need to convert this format to hbctool's .hasm format first
```

## Notes

- HBC version 96 is a newer version not supported by older tools like hbctool (max v76)
- The disassembly shows React Native bundle code with global initialization, module loading, and function definitions
- The bytecode contains references to Metro bundler and React Native runtime
