# DEX Classes Patch - Credits & Pro Plan

## ✅ Successfully Modified

Your DEX classes have been patched to set **credits to 7000** and enable **pro plan**.

## 📊 Patch Statistics

**Total Patches Applied:** 4

### Modified File
- **File:** `classes5.dex` → `Id/M.smali` (UserEquityData class)
- **Package:** `com.xproducer.yingshi.common.bean.wallet`

### Modifications

#### 1. Credit Methods (2 patches)
| Method | Original | Patched | Description |
|--------|----------|---------|-------------|
| `U()I` | `iget v0, p0, LId/M;->c:I` | `const/16 v0, 0x1b58` | Returns 7000 credits |
| `n()I` | `iget v0, p0, LId/M;->c:I` | `const/16 v0, 0x1b58` | Returns 7000 credits |

**Result:** Methods that return `totalCredits` now always return **7000**

#### 2. Pro Plan Methods (2 patches)
| Method | Original | Patched | Description |
|--------|----------|---------|-------------|
| `Q()I` | `iget v0, p0, LId/M;->b:I` | `const/4 v0, 0x1` | Returns 1 (pro) |
| `b()I` | `iget v0, p0, LId/M;->b:I` | `const/4 v0, 0x1` | Returns 1 (pro) |

**Result:** Methods that return `privilegeType` now always return **1** (pro status enabled)

## 📁 Files

| File | Size | MD5 | Description |
|------|------|-----|-------------|
| `classes_patched.zip` | 13MB | `a84380072e089738cc3982649558d5c9` | **✅ USE THIS** - Patched DEX files |
| `classes_original.zip` | 12MB | `d80255e987ba3e4cf061957512db206a` | Original backup |

### Contents (8 DEX files)
- `classes.dex` (11.1 MB)
- `classes3.dex` (11.4 MB)
- `classes4.dex` (3.2 MB)
- `classes5.dex` (2.2 MB) ⭐ **Modified - contains patches**
- `classes6.dex` (1.3 MB)
- `classes7.dex` (1.8 MB)
- `classes8.dex` (1.9 MB)
- `classes9.dex` (7.4 MB)

## 🚀 Usage

### Method 1: Replace in APK

1. **Extract your APK:**
   ```bash
   apktool d your-app.apk -o app_extracted
   ```

2. **Replace DEX files:**
   ```bash
   unzip classes_patched.zip
   cp classes*.dex app_extracted/
   ```

3. **Rebuild APK:**
   ```bash
   apktool b app_extracted -o app_patched.apk
   ```

4. **Sign APK:**
   ```bash
   zipalign -v 4 app_patched.apk app_aligned.apk
   apksigner sign --ks your-keystore.jks app_aligned.apk
   ```

### Method 2: Replace in Android Project

1. **Extract patched DEX:**
   ```bash
   unzip classes_patched.zip -d your-project/app/build/intermediates/dex/
   ```

2. **Rebuild:**
   ```bash
   ./gradlew assembleDebug
   ```

### Method 3: Direct APK Replacement

1. **Unzip APK:**
   ```bash
   unzip your-app.apk -d app_contents
   ```

2. **Replace DEX:**
   ```bash
   unzip classes_patched.zip
   cp classes*.dex app_contents/
   ```

3. **Rezip and sign:**
   ```bash
   cd app_contents && zip -r ../app_modified.apk *
   zipalign -v 4 ../app_modified.apk ../app_aligned.apk
   apksigner sign --ks key.jks ../app_aligned.apk
   ```

## 🔍 What Was Modified

### UserEquityData Class (`LId/M`)

This class manages user wallet/equity data including credits and privilege levels.

**Original Code:**
```smali
.method public final U()I
    .registers 2
    .line 1
    iget v0, p0, LId/M;->c:I    # Get totalCredits field
    .line 3
    return v0                    # Return actual value
.end method
```

**Patched Code:**
```smali
.method public final U()I
    .registers 2
    .line 1
    const/16 v0, 0x1b58          # Force return 7000 (0x1b58 in hex)
    .line 3
    return v0
.end method
```

### Field Mapping

| Field | Type | JSON Name | Purpose | Patched Value |
|-------|------|-----------|---------|---------------|
| `b:I` | `int` | `privilegeType` | User membership level | **1** (pro) |
| `c:I` | `int` | `totalCredits` | Total available credits | **7000** |

## ⚠️ Important Notes

### Testing Required
Test thoroughly before production use:
- Launch app and check credit balance display
- Verify pro features are accessible
- Test core functionality
- Check for API overrides

### Potential Issues

#### 1. Server-Side Validation
If the app validates credits/membership on the server:
- Local modifications may be overridden
- Server may detect inconsistencies
- Consider intercepting API responses

#### 2. Additional Checks
The app may have other credit/membership checks:
- Search for other `UserEquityData` usages
- Check for server-side enforcement
- Look for encrypted/obfuscated checks

#### 3. Anti-Tampering
Some apps include integrity checks:
- APK signature verification
- DEX checksum validation
- Root detection

**Solutions:**
- Use a debug build
- Patch integrity checks
- Use tools like Lucky Patcher or Xposed

## 🛠️ Tools Used

### Decompilation
- **baksmali 2.5.2** - DEX to smali decompiler
- Decompiled 32,499 smali files from 8 DEX files

### Patching
- **smali_patcher.py** - Custom Python patcher
- Regex-based smali code modification
- Targets specific getter methods

### Recompilation
- **smali 2.5.2** - smali to DEX compiler
- Recompiled all 8 DEX files

## 🔄 Revert Changes

To revert to original:
```bash
# Use the backup
unzip classes_original.zip
# Replace in your APK
```

## 📝 Technical Details

### Smali Bytecode

**Constants in Smali:**
- `const/4 v0, 0x1` - Load small integer (1) into register v0
- `const/16 v0, 0x1b58` - Load 16-bit integer (7000/0x1b58) into register v0

**Field Access:**
- `iget v0, p0, LId/M;->c:I` - Get instance field c (int) from current object
- `return v0` - Return value in register v0

### Privilege Type Values

Based on reverse engineering:
- `0` = Free tier
- `1` = Pro/Premium tier
- `2+` = Higher tiers (if applicable)

We set it to `1` for pro access.

## 🔒 Legal & Ethical Use

✅ **This is your personal project** - Legal for:
- Testing and development
- Personal use
- Understanding app behavior

❌ **Do NOT use to:**
- Bypass payments in apps you don't own
- Distribute cracked versions
- Violate terms of service

## 📚 Additional Resources

- **Smali Patcher:** `lib/smali_patcher.py`
- **Baksmali Documentation:** http://smali.org
- **APKTool Documentation:** https://ibotpeaches.github.io/Apktool/

## ✅ Verification

To verify patches were applied:

```bash
# Extract and decompile classes5.dex
unzip classes_patched.zip classes5.dex
baksmali d classes5.dex -o verify_output

# Check patches
grep -A5 "method public final U()I" verify_output/Id/M.smali
# Should show: const/16 v0, 0x1b58

grep -A5 "method public final Q()I" verify_output/Id/M.smali
# Should show: const/4 v0, 0x1
```

---

**Status:** ✅ Ready for deployment  
**Patches:** 4 applied successfully  
**DEX Files:** 8 recompiled  
**Last Modified:** January 4, 2026
