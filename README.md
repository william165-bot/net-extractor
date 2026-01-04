# Net Extractor

Hermes Bytecode (HBC) Disassembler and Extractor for React Native bundles.

## Project Structure

```
net-extractor/
├── data/
│   ├── hasm_output/          # Disassembled output directory
│   │   ├── bytecode_dump.txt # Main disassembly (49MB)
│   │   ├── modules_dump.txt  # Module structure (622KB)
│   │   ├── strings_dump.txt  # Extracted strings (2.8MB)
│   │   ├── objects_dump.txt  # Object structures (203KB)
│   │   ├── arrays_dump.txt   # Array definitions
│   │   ├── bytecode.hex      # Hex dump (464KB)
│   │   ├── strings.txt       # Alternative string extraction
│   │   ├── hbc_info.json     # Bundle metadata
│   │   └── README.md         # Detailed documentation
│   ├── hasm_output.zip       # Compressed archive (8.5MB)
│   └── index.android.bundle.original # Original HBC file (7.9MB)
├── controllers/
├── lib/
└── README.md
```

## Features

- ✅ Supports HBC version 96 (latest Hermes bytecode)
- ✅ Complete bytecode disassembly with opcodes and instructions
- ✅ Module and dependency extraction
- ✅ String literal extraction (multiple methods)
- ✅ Object and array structure analysis
- ✅ Hex dump for low-level analysis
- ✅ Ready for reassembly (future)

## Tools Used

### hermes_rs (v0.1.13)
Rust-based Hermes bytecode toolkit supporting HBC versions 89-96.

**Installed tools:**
- `bytecode` - Main disassembly
- `strings` - String extraction
- `modules` - Module analysis
- `objects` - Object extraction
- `arrays` - Array extraction

### Installation
```bash
cargo install hermes_rs
```

## Usage

### Disassemble HBC Bundle

```bash
# Full bytecode disassembly
bytecode input.bundle > bytecode_dump.txt

# Extract strings
strings input.bundle > strings_dump.txt

# Extract modules
modules input.bundle > modules_dump.txt

# Extract objects
objects input.bundle > objects_dump.txt

# Extract arrays
arrays input.bundle > arrays_dump.txt
```

### Alternative Tools Attempted

1. **hbctool** (Python) - Only supports HBC v59-76, failed on v96
2. **hbcdump** (Official Hermes) - v0.13.0 didn't produce output for v96
3. **hermes-dec** - Development version, incomplete

## Output Files

See [@data/hasm_output/README.md](data/hasm_output/README.md) for detailed documentation of all output files.

**Download:** [@data/hasm_output.zip](data/hasm_output.zip) (8.5MB compressed, 54MB uncompressed)

## Reassembly (Future)

Currently, the output from `hermes_rs` is in a custom format. To reassemble:

1. Convert disassembly to hbctool's `.hasm` format, or
2. Wait for `hermes_rs` to support direct reassembly from its output format
3. Use official Hermes compiler tools

The standard `hbctool asm` command would work once the format is converted:
```bash
hbctool asm <HASM_PATH> <HBC_FILE>
```

## Technical Details

**Original Bundle:**
- File: `index.android.bundle`
- Size: 7.9MB (8,250,568 bytes)
- Type: Hermes JavaScript bytecode
- Version: 96
- Magic: 0x1f1903c103bc1fc6

**Disassembly Output:**
- Total Size: ~54MB uncompressed, 8.5MB compressed
- Format: Human-readable text with opcodes and instructions
- Contains: React Native runtime initialization, module system, and application code

## Notes

- HBC v96 is newer than most disassembly tools support
- The bundle contains React Native Metro bundler output
- All strings, modules, and function structures are preserved
- The disassembly shows complete instruction flow with jump labels

## License

MIT
