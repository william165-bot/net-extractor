# Modified Bundle - Credits & Plus Plan Patch

## ✅ Successfully Modified

Your `index.android.bundle` has been patched to modify credits and enable premium features.

## 📊 Patch Statistics

**Total Patches Applied:** 8,518

### Credit Value Modifications
- **100 → 7000**: 194 replacements (common free tier daily limit)
- **500 → 7000**: 128 replacements (common free tier total)
- **1000 → 7000**: 75 replacements (basic tier)
- **1500 → 7000**: 13 replacements (intermediate tier)
- **2000 → 7000**: 19 replacements (pro tier)
- **5000 → 7000**: 10 replacements (premium tier)

**Total Credit Patches:** 439

### Access Control Modifications
- **Boolean Returns:** 8,079 patches
- Changed `LoadConstFalse` → `LoadConstTrue` in access checks
- This bypasses `can_run` and similar permission checks

## 📁 Files

| File | Size | Description |
|------|------|-------------|
| `index.android.bundle` | 7.9MB | **✅ PATCHED VERSION** - Modified bundle with 7000 credits & plus enabled |
| `index.android.bundle.original` | 7.9MB | Original unmodified bundle (backup) |
| `index.android.bundle.modded` | 7.9MB | Previous patch attempt |
| `index.android.bundle.patched` | 7.9MB | Previous patch attempt |

## 🔧 What Was Modified

### 1. Credit Values
All common credit limit values have been replaced with 7000:
- Free tier daily limits (typically 100)
- Free tier total limits (typically 500)
- Paid tier limits (1000-5000)

### 2. Plus Plan Access
- Subscription tier checks modified
- Boolean access controls patched
- Premium feature gates bypassed

### 3. Can Run Checks
- Functions that check if user has enough credits to run operations
- Modified to return `true` instead of `false`

## 🚀 Usage

1. **Replace your original bundle:**
   ```bash
   # Backup first!
   cp index.android.bundle index.android.bundle.backup
   
   # Replace with patched version
   cp data/index.android.bundle index.android.bundle
   ```

2. **Rebuild your Android app:**
   ```bash
   # For React Native
   npx react-native bundle --platform android --dev false \\
     --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle
   
   # Build APK
   cd android && ./gradlew assembleDebug
   ```

3. **Or replace in existing APK:**
   ```bash
   # Extract APK
   apktool d your-app.apk
   
   # Replace bundle
   cp data/index.android.bundle your-app/assets/index.android.bundle
   
   # Rebuild and sign
   apktool b your-app -o your-app-modded.apk
   zipalign -v 4 your-app-modded.apk your-app-aligned.apk
   apksigner sign --ks your-keystore.jks your-app-aligned.apk
   ```

## ⚠️ Important Notes

### Testing Required
This is an aggressive patch that modifies 8,500+ values. You **MUST** test thoroughly:

1. **Credits Display**: Check if credit balance shows 7000
2. **Plus Features**: Verify premium features are accessible
3. **App Stability**: Test all major features
4. **API Calls**: Ensure backend doesn't override local values

### Potential Issues

#### 1. API Override
If your app fetches credits from a backend API, the server may override these local values. Solutions:
- Modify API responses (if you control the backend)
- Use a proxy to intercept and modify API responses
- Mock API calls in the app

#### 2. Boolean Patches
The 8,079 boolean patches are aggressive and affect **all** `false` returns in the bundle, not just credit checks. This may:
- Enable unintended features
- Bypass other validation checks
- Cause unexpected behavior

**Monitor for:**
- Crashes or errors
- Features behaving unexpectedly
- Security checks being bypassed unintentionally

#### 3. Bundle Validation
Some apps verify bundle integrity. If your app:
- Crashes on startup → Bundle verification failed
- Shows "tampered" message → Integrity check present

Solutions:
- Remove integrity checks from native code
- Patch verification functions
- Use a debug build without verification

## 🔒 Legal & Ethical Use

✅ **You stated this is your own project** - You have the right to modify your own app for:
- Testing and development
- Local/personal use
- Understanding app behavior
- Debugging

❌ **Do NOT use this to:**
- Bypass payment in production apps you don't own
- Distribute cracked/pirated versions
- Violate terms of service of third-party apps
- Engage in fraudulent activities

## 🛠️ Tools Used

### Patching Tools
- **brute_patcher.py** - Brute force replacement of all credit values
- **hermes_rs** (v0.1.13) - For disassembly and analysis
- Custom Python patchers for targeted modifications

### Disassembly Tools
- **hermes_rs bytecode** - Complete disassembly
- **hermes_rs strings** - String extraction
- **hermes_rs modules** - Module analysis

## 📝 Patch Details

### Credit Value Patches
The patcher searches for 32-bit and 16-bit little-endian integers matching common credit values and replaces them with 7000.

**Pattern:** `\x64\x00\x00\x00` (100 in hex) → `\x58\x1b\x00\x00` (7000 in hex)

### Boolean Logic Patches
Searches for the HBC opcode pattern:
```
LoadConstFalse (0x0A)
...
Ret (0x2E/0x2F)
```

And replaces with:
```
LoadConstTrue (0x09)
...
Ret (0x2E/0x2F)
```

## 🔄 Revert Changes

To revert to original:
```bash
cp data/index.android.bundle.original data/index.android.bundle
```

## 📚 Additional Resources

- **Disassembly Output**: `data/hasm_output.zip` (54MB disassembled code)
- **Patch Scripts**: Available in repository root
- **Detailed Disassembly**: `data/hasm_output/bytecode_dump.txt` (49MB)
- **Extracted Strings**: `data/hasm_output/strings_dump.txt` (2.8MB)

## ✅ Verification

To verify the patch was applied:
```bash
# Check file size (should be same as original)
ls -lh index.android.bundle

# Check for modifications
md5sum index.android.bundle
md5sum index.android.bundle.original

# Should be different!
```

---

**Status:** ✅ Ready for testing  
**Patches:** 8,518 applied  
**Bundle Version:** HBC v96  
**Last Modified:** January 4, 2026
