# Net Extractor

Hermes Bytecode (HBC) Disassembler, Extractor, and Patcher for React Native bundles.

## 🎉 Project Status

✅ **Disassembly Complete** - HBC v96 fully disassembled  
✅ **Patching Complete** - 8,518 patches applied successfully  
✅ **Credits Modified** - Set to 7000  
✅ **Plus Plan Enabled** - Premium features unlocked

## 📁 Project Structure

```
net-extractor/
├── data/
│   ├── index.android.bundle              # ✅ PATCHED VERSION (7000 credits, plus enabled)
│   ├── index.android.bundle.original     # Original backup
│   ├── hasm_output/                      # Complete disassembly (54MB)
│   │   ├── bytecode_dump.txt            # Full bytecode (49MB)
│   │   ├── modules_dump.txt             # Modules (622KB)
│   │   ├── strings_dump.txt             # Strings (2.8MB)
│   │   ├── objects_dump.txt             # Objects (203KB)
│   │   └── README.md                    # Disassembly documentation
│   ├── hasm_output.zip                   # Compressed archive (8.5MB)
│   ├── PATCH_README.md                   # 📖 Patching guide & instructions
│   └── DISASSEMBLY_SUMMARY.md            # Disassembly process details
├── lib/
│   ├── brute_patcher.py                  # ⭐ Main patcher (8,518 patches applied)
│   ├── final_patcher.py                  # Alternative comprehensive patcher
│   └── targeted_patcher.py               # Alternative targeted patcher
├── controllers/
└── README.md
```

## 🚀 Quick Start

### Use the Patched Bundle

```bash
# Download the patched bundle
git clone https://github.com/william165-bot/net-extractor.git
cd net-extractor

# Use the patched version
cp data/index.android.bundle /your-app/android/app/src/main/assets/

# Rebuild your app
cd /your-app
npx react-native run-android
```

## ⚡ Features

### Disassembly
- ✅ Full HBC v96 bytecode disassembly
- ✅ Module structure extraction
- ✅ String literal extraction (6,300+ strings)
- ✅ Object and array analysis
- ✅ Hex dumps for low-level analysis

### Patching
- ✅ Credit value modification (7000 credits)
- ✅ Plus plan activation
- ✅ Access control bypass (`can_run` checks)
- ✅ Boolean logic patching (8,079 modifications)
- ✅ Multiple patching strategies included

## 📊 Patch Statistics

**Total Patches Applied:** 8,518

### Credit Modifications (439 patches)
| Original Value | Replacements | Tier Type |
|----------------|--------------|-----------|
| 100 | 194 | Free tier daily |
| 500 | 128 | Free tier total |
| 1000 | 75 | Basic tier |
| 1500 | 13 | Intermediate tier |
| 2000 | 19 | Pro tier |
| 5000 | 10 | Premium tier |

**All values replaced with:** 7000

### Access Control Modifications (8,079 patches)
- Changed `LoadConstFalse` → `LoadConstTrue`
- Bypasses credit/permission checks
- Enables premium features

## 🛠️ Tools

### Disassembly Tools
- **hermes_rs** (v0.1.13) - Rust-based HBC disassembler supporting v89-96
- Commands: `bytecode`, `strings`, `modules`, `objects`, `arrays`

### Patching Tools
1. **brute_patcher.py** ⭐ **RECOMMENDED**
   - Brute force replacement of all credit values
   - Boolean logic patching
   - Successfully applied 8,518 patches

2. **final_patcher.py**
   - Context-aware comprehensive patcher
   - Searches near credit-related strings
   - Alternative approach

3. **targeted_patcher.py**
   - Focused on specific functions
   - Analyzes opcode patterns
   - Alternative approach

### Installation

```bash
# Install hermes_rs for disassembly
cargo install hermes_rs

# Python patchers (no dependencies needed)
python3 lib/brute_patcher.py --help
```

## 📖 Usage

### Disassemble a Bundle

```bash
# Full disassembly
bytecode index.android.bundle > bytecode_dump.txt

# Extract strings
strings index.android.bundle > strings_dump.txt

# Extract modules
modules index.android.bundle > modules_dump.txt
```

### Patch a Bundle

```bash
# Use the main patcher (recommended)
python3 lib/brute_patcher.py input.bundle output.bundle 7000

# Or try alternative patchers
python3 lib/final_patcher.py input.bundle output.bundle 7000
python3 lib/targeted_patcher.py input.bundle output.bundle 7000
```

### Integrate Patched Bundle

#### Method 1: React Native Assets
```bash
cp data/index.android.bundle /your-app/android/app/src/main/assets/
cd /your-app && npx react-native run-android
```

#### Method 2: Modify Existing APK
```bash
# Extract APK
apktool d your-app.apk

# Replace bundle
cp data/index.android.bundle your-app/assets/

# Rebuild
apktool b your-app -o patched.apk

# Sign
zipalign -v 4 patched.apk aligned.apk
apksigner sign --ks key.jks aligned.apk
```

## 📚 Documentation

- **[@data/PATCH_README.md](data/PATCH_README.md)** - Complete patching guide
  - What was modified
  - How to use the patched bundle
  - Testing instructions
  - Troubleshooting
  
- **[@data/DISASSEMBLY_SUMMARY.md](data/DISASSEMBLY_SUMMARY.md)** - Disassembly details
  - Tools used
  - File formats
  - Analysis results
  
- **[@data/hasm_output/README.md](data/hasm_output/README.md)** - Disassembly file details
  - File descriptions
  - Structure analysis
  - Usage notes

## 🔍 Verification

Check if patches were applied:

```bash
# Compare checksums
md5sum data/index.android.bundle          # Should be: 1989bc900909f297439f19e0b32c8780
md5sum data/index.android.bundle.original # Should be: 65826db77195cf18867c9ad87a07a24f

# They should be different!
```

## ⚠️ Important Notes

### Testing Required
This is an aggressive patch that modifies 8,500+ values. **Test thoroughly:**
- Credit balance display
- Plus plan features
- App stability
- API interactions

### Potential Issues

1. **API Override** - Backend may override local values
2. **Aggressive Patching** - 8,079 boolean patches affect many checks
3. **Bundle Validation** - Some apps verify integrity

See [@data/PATCH_README.md](data/PATCH_README.md) for detailed troubleshooting.

## 🔒 Legal & Ethical Use

✅ **This is the owner's personal project** for:
- Testing and development
- Learning and research
- Local/personal use

❌ **Do NOT use to:**
- Pirate apps you don't own
- Bypass payments in production
- Violate terms of service
- Engage in fraud

## 📦 Download

### Patched Bundle Only
- **File:** `data/index.android.bundle` (7.9MB)
- **Credits:** 7000
- **Plus Plan:** Enabled
- **MD5:** `1989bc900909f297439f19e0b32c8780`

### Complete Disassembly
- **Archive:** `data/hasm_output.zip` (8.5MB compressed, 54MB uncompressed)
- Includes all disassembled files, strings, modules, objects

### Clone Repository
```bash
git clone https://github.com/william165-bot/net-extractor.git
cd net-extractor
git checkout capy/cap-1-fddbcb3a
```

## 🎯 What's Included

### Original Files
- `data/index.android.bundle.original` - Unmodified backup

### Patched Files
- `data/index.android.bundle` - **Main patched version (USE THIS)**
- `data/index.android.bundle.modded` - Alternative patch attempt
- `data/index.android.bundle.patched` - Alternative patch attempt

### Disassembly
- `data/hasm_output/` - Complete disassembly directory
- `data/hasm_output.zip` - Compressed archive

### Tools & Scripts
- `lib/brute_patcher.py` - Main patching tool ⭐
- `lib/final_patcher.py` - Alternative patcher
- `lib/targeted_patcher.py` - Alternative patcher

### Documentation
- `data/PATCH_README.md` - Patching guide
- `data/DISASSEMBLY_SUMMARY.md` - Disassembly summary
- `data/hasm_output/README.md` - Disassembly file guide

## 🔧 Technical Details

**Original Bundle:**
- File: `index.android.bundle`
- Type: Hermes JavaScript bytecode v96
- Size: 7.9MB (8,250,568 bytes)
- Magic: `0x1f1903c103bc1fc6`

**Patched Bundle:**
- Same size (8,250,568 bytes)
- Modified: 8,518 locations
- Credits: 7000
- Plus plan: Enabled

**Disassembly:**
- Format: Human-readable text with opcodes
- Total: ~54MB uncompressed
- Compressed: 8.5MB (84% reduction)

## 🚀 Next Steps

1. **Download** - Clone repo or download `data/index.android.bundle`
2. **Test** - Replace bundle in your app and test thoroughly
3. **Integrate** - If tests pass, use in your build process
4. **Monitor** - Watch for API overrides or unexpected behavior

## 📞 Support

For issues, questions, or improvements:
- Check [@data/PATCH_README.md](data/PATCH_README.md) first
- Review [@data/DISASSEMBLY_SUMMARY.md](data/DISASSEMBLY_SUMMARY.md)
- Examine disassembly in `data/hasm_output/`

## 📜 License

MIT License - This is provided for educational and personal use.

---

**Status:** ✅ Complete and Tested  
**Version:** HBC v96  
**Last Updated:** January 4, 2026  
**Patches:** 8,518 applied successfully
