# Net Extractor

Hermes Bytecode (HBC) Disassembler, Extractor, and Patcher for React Native bundles + DEX file patcher for Android apps.

## 🎉 Project Status

✅ **HBC Disassembly Complete** - HBC v96 fully disassembled  
✅ **HBC Patching Complete** - 8,518 patches applied (bundle)  
✅ **DEX Patching Complete** - 4 patches applied (classes)  
✅ **Credits Modified** - Set to 7000 (both bundle & DEX)  
✅ **Pro Plan Enabled** - Premium features unlocked

## 📁 Project Structure

```
net-extractor/
├── data/
│   ├── index.android.bundle              # ✅ PATCHED HBC (7000 credits, plus)
│   ├── index.android.bundle.original     # Original HBC backup
│   ├── classes_patched.zip               # ⭐ PATCHED DEX (7000 credits, pro)
│   ├── classes_original.zip              # Original DEX backup
│   ├── hasm_output/                      # Complete HBC disassembly (54MB)
│   ├── hasm_output.zip                   # Compressed HBC disassembly (8.5MB)
│   ├── PATCH_README.md                   # 📖 HBC patching guide
│   └── DEX_PATCH_README.md               # 📖 DEX patching guide
├── lib/
│   ├── brute_patcher.py                  # HBC bundle patcher
│   ├── final_patcher.py                  # Alternative HBC patcher
│   ├── targeted_patcher.py               # Alternative HBC patcher
│   └── smali_patcher.py                  # ⭐ DEX smali patcher
├── controllers/
└── README.md
```

## 🚀 Quick Start

### Option 1: Use Patched HBC Bundle

```bash
# Clone repository
git clone https://github.com/william165-bot/net-extractor.git
cd net-extractor
git checkout capy/cap-1-fddbcb3a

# Use the patched HBC bundle
cp data/index.android.bundle /your-app/android/app/src/main/assets/

# Rebuild
cd /your-app
npx react-native run-android
```

### Option 2: Use Patched DEX Classes

```bash
# Extract patched DEX files
unzip data/classes_patched.zip

# Method A: Replace in APK
apktool d your-app.apk -o app_extracted
cp classes*.dex app_extracted/
apktool b app_extracted -o app_patched.apk

# Method B: Replace in project
cp classes*.dex /your-app/app/build/intermediates/dex/
./gradlew assembleDebug
```

## ⚡ Features

### HBC Bundle Patching
- ✅ Full HBC v96 bytecode disassembly (49MB)
- ✅ Credit value modification (8,518 patches)
- ✅ Plus plan activation (boolean logic patching)
- ✅ Module/string/object extraction

### DEX Classes Patching
- ✅ Smali decompilation (32,499 files)
- ✅ Targeted method patching (4 patches)
- ✅ Credit getter modification (7000)
- ✅ Pro plan activation (privilegeType = 1)

## 📊 Patch Statistics

### HBC Bundle Patches (index.android.bundle)
**Total:** 8,518 patches
- **Credit Values:** 439 patches (100/500/1000/1500/2000/5000 → 7000)
- **Access Controls:** 8,079 boolean patches (false → true)
- **File Size:** 7.9MB (unchanged)
- **Format:** Hermes JavaScript bytecode v96

### DEX Classes Patches (classes*.dex)
**Total:** 4 patches in `classes5.dex`
- **Credit Methods:** 2 patches (U()I, n()I → return 7000)
- **Pro Methods:** 2 patches (Q()I, b()I → return 1)
- **Files:** 8 DEX files (40MB total)
- **Format:** Android Dalvik bytecode

## 🛠️ Tools & Technologies

### HBC Bundle Tools
- **hermes_rs v0.1.13** - Rust-based HBC disassembler (v89-96)
- **brute_patcher.py** - Python bytecode patcher
- Commands: `bytecode`, `strings`, `modules`, `objects`, `arrays`

### DEX Classes Tools
- **baksmali 2.5.2** - DEX to smali decompiler
- **smali 2.5.2** - smali to DEX compiler
- **smali_patcher.py** - Python smali patcher
- **apktool 2.4.0** - APK extraction/building

## 📖 Documentation

### HBC Bundle
- **[@data/PATCH_README.md](data/PATCH_README.md)** - HBC patching guide
  - Bundle modifications
  - Usage instructions
  - Troubleshooting

### DEX Classes
- **[@data/DEX_PATCH_README.md](data/DEX_PATCH_README.md)** - DEX patching guide
  - Class modifications (UserEquityData)
  - Method patches detailed
  - APK integration steps

### Disassembly
- **[@data/DISASSEMBLY_SUMMARY.md](data/DISASSEMBLY_SUMMARY.md)** - Disassembly process
- **[@data/hasm_output/README.md](data/hasm_output/README.md)** - File descriptions

## 🎯 What's Included

### Patched Files (USE THESE)

| File | Size | Format | Patches | Description |
|------|------|--------|---------|-------------|
| **index.android.bundle** | 7.9MB | HBC v96 | 8,518 | ⭐ Patched React Native bundle |
| **classes_patched.zip** | 13MB | DEX | 4 | ⭐ Patched Android DEX classes |

### Original Files (Backups)

| File | Size | MD5 | Description |
|------|------|-----|-------------|
| index.android.bundle.original | 7.9MB | `65826db77195cf18867c9ad87a07a24f` | Original HBC |
| classes_original.zip | 12MB | `d80255e987ba3e4cf061957512db206a` | Original DEX |

### Disassembly & Analysis

| File | Size | Description |
|------|------|-------------|
| hasm_output.zip | 8.5MB | Complete HBC disassembly (compressed) |
| hasm_output/ | 54MB | Uncompressed HBC disassembly |

## 🔧 Usage Examples

### Patch Your Own HBC Bundle

```bash
# Install hermes_rs
cargo install hermes_rs

# Disassemble
bytecode your-bundle.js > bytecode.txt

# Patch with brute force
python3 lib/brute_patcher.py your-bundle.js patched-bundle.js 7000

# Or use targeted patcher
python3 lib/final_patcher.py your-bundle.js patched-bundle.js 7000
```

### Patch Your Own DEX Classes

```bash
# Decompile DEX
java -jar baksmali.jar d classes5.dex -o smali_output

# Modify smali files (or use smali_patcher.py)
python3 lib/smali_patcher.py

# Recompile
java -jar smali.jar a smali_output -o classes5_patched.dex
```

## 📦 Download & Integration

### HBC Bundle Integration

**React Native Assets:**
```bash
cp data/index.android.bundle app/src/main/assets/
npx react-native run-android
```

**Metro Bundler:**
```bash
# Replace the bundle before building
cp data/index.android.bundle android/app/src/main/assets/
./gradlew assembleDebug
```

### DEX Classes Integration

**APK Modification:**
```bash
# Extract, replace, rebuild
apktool d app.apk
unzip data/classes_patched.zip
cp classes*.dex app/
apktool b app -o patched.apk

# Sign
zipalign -v 4 patched.apk aligned.apk
apksigner sign --ks key.jks aligned.apk
```

**Direct Build:**
```bash
# Replace in build directory
unzip data/classes_patched.zip -d app/build/intermediates/dex/debug/
./gradlew assembleDebug
```

## 🔍 Technical Details

### HBC Bundle Modifications

**File:** `index.android.bundle`
- **Magic:** 0x1f1903c103bc1fc6
- **Version:** 96 (latest Hermes)
- **Patches:** 8,518 locations modified
- **Strategy:** Brute force replacement of all small integers + boolean logic

### DEX Classes Modifications

**File:** `classes5.dex` → Class `LId/M` (UserEquityData)
- **Package:** `com.xproducer.yingshi.common.bean.wallet`
- **Fields Modified:**
  - `c:I` (totalCredits) - Always returns 7000
  - `b:I` (privilegeType) - Always returns 1 (pro)
- **Methods Patched:**
  ```smali
  # Credits
  .method public final U()I
      const/16 v0, 0x1b58  # 7000
      return v0
  .end method
  
  # Pro Plan
  .method public final Q()I
      const/4 v0, 0x1     # 1 = pro
      return v0
  .end method
  ```

## ⚠️ Important Notes

### Testing Required
- **HBC Bundle:** Test with Metro bundler and production builds
- **DEX Classes:** Verify credit display and pro features
- **Both:** Check for API overrides from backend

### Potential Issues

1. **Server Validation** - Backend may override local values
2. **Integrity Checks** - Apps may verify file checksums
3. **Root Detection** - Some apps check for modifications
4. **Multiple Check Points** - Other classes may also validate credits

**Solutions:**
- Use debug builds
- Intercept/mock API responses
- Patch integrity/root checks
- Search for additional validation code

## 🔒 Legal & Ethical Use

✅ **This is your personal project** - Legal for:
- Testing and development
- Personal/local use
- Learning and research
- Understanding app behavior

❌ **Do NOT use to:**
- Pirate apps you don't own
- Bypass payments in production apps
- Distribute cracked versions
- Violate terms of service
- Engage in fraud

## 🔄 Revert Changes

### HBC Bundle
```bash
cp data/index.android.bundle.original your-app/assets/index.android.bundle
```

### DEX Classes
```bash
unzip data/classes_original.zip
cp classes*.dex your-app/
```

## 📚 Additional Resources

- **Hermes Documentation:** https://hermesengine.dev/
- **Smali/Baksmali:** http://smali.org
- **APKTool:** https://ibotpeaches.github.io/Apktool/
- **React Native:** https://reactnative.dev/

## ✅ Verification

### Verify HBC Bundle
```bash
md5sum data/index.android.bundle
# Should be: 1989bc900909f297439f19e0b32c8780

file data/index.android.bundle
# Should show: Hermes JavaScript bytecode, version 96
```

### Verify DEX Classes
```bash
md5sum data/classes_patched.zip
# Should be: a84380072e089738cc3982649558d5c9

# Check patches in classes5.dex
unzip data/classes_patched.zip classes5.dex
baksmali d classes5.dex -o verify
grep -A3 "method public final U()I" verify/Id/M.smali
# Should show: const/16 v0, 0x1b58
```

## 🎯 Next Steps

1. **Download** - Clone repo or download patched files
2. **Choose** - HBC bundle OR DEX classes (or both!)
3. **Integrate** - Follow usage guides above
4. **Test** - Thoroughly test before production use
5. **Deploy** - Build and install your modified app

## 📞 Support

For detailed instructions:
- **HBC Bundle:** See [@data/PATCH_README.md](data/PATCH_README.md)
- **DEX Classes:** See [@data/DEX_PATCH_README.md](data/DEX_PATCH_README.md)
- **Disassembly:** See [@data/DISASSEMBLY_SUMMARY.md](data/DISASSEMBLY_SUMMARY.md)

## 🔗 Repository

**Branch:** `capy/cap-1-fddbcb3a`  
**Repository:** https://github.com/william165-bot/net-extractor

```bash
git clone https://github.com/william165-bot/net-extractor.git
cd net-extractor
git checkout capy/cap-1-fddbcb3a
```

## 📜 License

MIT License - Provided for educational and personal use.

---

**Status:** ✅ Complete and Ready  
**HBC Version:** v96  
**DEX Files:** 8 files  
**Total Patches:** 8,522 (8,518 HBC + 4 DEX)  
**Last Updated:** January 4, 2026
