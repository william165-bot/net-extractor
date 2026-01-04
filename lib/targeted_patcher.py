#!/usr/bin/env python3
"""
Targeted Hermes Bytecode Patcher
Patches specific function return values for credits and subscription
"""

import sys
import struct
import os

def find_pattern(data, pattern):
    """Find all occurrences of a byte pattern"""
    positions = []
    offset = 0
    while True:
        pos = data.find(pattern, offset)
        if pos == -1:
            break
        positions.append(pos)
        offset = pos + 1
    return positions

def patch_bundle(input_file, output_file, target_credits=7000):
    """Main patching function"""
    
    print(f"Reading: {input_file}")
    with open(input_file, 'rb') as f:
        data = bytearray(f.read())
    
    original_size = len(data)
    print(f"Size: {original_size:,} bytes\n")
    
    patches_applied = []
    
    # ===== STRATEGY 1: Patch credit balance checks =====
    # Find the pattern where balance/total is accessed and returned
    # Based on disassembly: GetById r0, r2, 2, "total"
    
    print("[1] Searching for 'total' credit references...")
    total_str = b'"total"'
    total_positions = find_pattern(data, total_str)
    if not total_positions:
        total_str = b"total"
        total_positions = find_pattern(data, total_str)
    
    print(f"    Found {len(total_positions)} 'total' references")
    
    # After finding "total", look for return patterns and inject larger values
    for pos in total_positions[:5]:  # Patch first 5
        # Look in 200 bytes after "total" for Ret opcodes
        search_end = min(len(data), pos + 200)
        for i in range(pos, search_end):
            # Look for Ret opcode (0x2E or 0x2F in most HBC versions)
            if data[i] in [0x2E, 0x2F]:
                # Look backward for LoadConst opcodes
                for j in range(max(0, i - 20), i):
                    # Check for LoadConstInt pattern (opcode around 0x43-0x44)
                    if data[j] in [0x43, 0x44, 0x45, 0x46]:
                        # This might be loading a credit value
                        # Try to replace it with our target
                        if j + 5 < len(data):
                            # Assume 32-bit int follows opcode
                            old_value = struct.unpack('<I', data[j+1:j+5])[0]
                            if 0 < old_value < 10000:  # Reasonable credit range
                                struct.pack_into('<I', data, j+1, target_credits)
                                patches_applied.append(f"Credit value {old_value} -> {target_credits} at {hex(j)}")
                                print(f"    ✓ Patched credit value at {hex(j)}")
                break
    
    # ===== STRATEGY 2: Patch "can_run" to always true =====
    print("\n[2] Patching 'can_run' checks...")
    can_run_str = b"can_run"
    can_run_positions = find_pattern(data, can_run_str)
    print(f"    Found {len(can_run_positions)} 'can_run' references")
    
    for pos in can_run_positions:
        # Search after "can_run" for boolean return patterns
        search_start = pos + len(can_run_str)
        search_end = min(len(data), search_start + 150)
        
        for i in range(search_start, search_end):
            # Pattern: LoadConstFalse (0x0A) followed by Ret
            if data[i] == 0x0A:  # LoadConstFalse
                # Check if Ret follows within 3 bytes
                for j in range(i+1, min(i+4, len(data))):
                    if data[j] in [0x2E, 0x2F]:  # Ret opcode
                        # Patch LoadConstFalse to LoadConstTrue
                        data[i] = 0x09  # LoadConstTrue opcode
                        patches_applied.append(f"can_run false->true at {hex(i)}")
                        print(f"    ✓ Patched can_run check at {hex(i)}")
                        break
    
    # ===== STRATEGY 3: Patch subscription tier ======
    print("\n[3] Patching subscription tier...")
    
    # Find "kortix_plus" and make sure it's recognized
    kortix_plus = b"kortix_plus"
    plus_positions = find_pattern(data, kortix_plus)
    print(f"    Found {len(plus_positions)} kortix_plus references")
    patches_applied.append(f"kortix_plus found at {len(plus_positions)} locations")
    
    # Patch any "free" tier string to "plus"
    # Look for null-terminated strings
    free_patterns = [
        b"free\x00",  # Null terminated
        b'"free"',    # JSON string
        b"'free'",    # JS string
    ]
    
    for pattern in free_patterns:
        positions = find_pattern(data, pattern)
        if positions:
            print(f"    Found {len(positions)} instances of {pattern}")
            for pos in positions[:3]:  # Patch first 3
                # Check context - is this near subscription/tier keywords?
                context_start = max(0, pos - 1000)
                context = data[context_start:pos + 1000]
                
                if b"subscription" in context or b"tier" in context or b"kortix" in context:
                    # Patch "free" to "plus" (same length!)
                    if pattern == b"free\x00":
                        data[pos:pos+4] = b"plus"
                    elif pattern == b'"free"':
                        data[pos+1:pos+5] = b"plus"
                    elif pattern == b"'free'":
                        data[pos+1:pos+5] = b"plus"
                    
                    patches_applied.append(f"tier free->plus at {hex(pos)}")
                    print(f"    ✓ Patched tier string at {hex(pos)}")
    
    # ===== STRATEGY 4: Force balance to 7000 =====
    print("\n[4] Patching balance values...")
    balance_str = b"balance"
    balance_positions = find_pattern(data, balance_str)
    print(f"    Found {len(balance_positions)} 'balance' references")
    
    # After balance, look for GetById and potential value loads
    for pos in balance_positions[:5]:
        search_start = pos + len(balance_str)
        search_end = min(len(data), search_start + 100)
        
        # Look for LoadConstInt opcodes
        for i in range(search_start, search_end):
            if data[i] in [0x43, 0x44, 0x45, 0x46]:  # LoadConstInt variants
                if i + 5 < len(data):
                    old_value = struct.unpack('<I', data[i+1:i+5])[0]
                    if 0 < old_value < 10000:
                        struct.pack_into('<I', data, i+1, target_credits)
                        patches_applied.append(f"Balance {old_value} -> {target_credits} at {hex(i)}")
                        print(f"    ✓ Patched balance at {hex(i)}")
    
    # ===== STRATEGY 5: Patch specific small credit values =====
    print("\n[5] Patching hardcoded credit limits...")
    
    # Common free tier values to patch
    values_to_patch = [100, 500, 1000, 1500, 2000]
    
    for value in values_to_patch:
        pattern = struct.pack('<I', value)
        positions = find_pattern(data, pattern)
        
        if positions:
            print(f"    Found {len(positions)} instances of value {value}")
            
            # Be selective - only patch those near credit keywords
            patched = 0
            for pos in positions:
                if patched >= 3:  # Limit patches per value
                    break
                
                # Check context
                context_start = max(0, pos - 500)
                context_end = min(len(data), pos + 500)
                context = data[context_start:context_end]
                
                # Count credit-related markers
                markers = [b"credit", b"balance", b"total", b"tier"]
                marker_count = sum(1 for m in markers if m in context)
                
                if marker_count >= 1:  # At least 1 credit marker nearby
                    struct.pack_into('<I', data, pos, target_credits)
                    patches_applied.append(f"Value {value} -> {target_credits} at {hex(pos)}")
                    print(f"    ✓ Patched {value} -> {target_credits} at {hex(pos)}")
                    patched += 1
    
    # Write output
    print(f"\nWriting: {output_file}")
    with open(output_file, 'wb') as f:
        f.write(data)
    
    # Summary
    print("\n" + "="*70)
    print(f"SUMMARY: {len(patches_applied)} total patches applied")
    print("="*70)
    for patch in patches_applied:
        print(f"  • {patch}")
    
    print("\n" + "="*70)
    if len(patches_applied) > 0:
        print("✅ Patching completed!")
    else:
        print("⚠️  No patches applied")
    print("="*70)
    
    return len(patches_applied)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 targeted_patcher.py <input> <output> [credits]")
        print("Example: python3 targeted_patcher.py input.bundle output.bundle 7000")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_credits = int(sys.argv[3]) if len(sys.argv) > 3 else 7000
    
    print("="*70)
    print("TARGETED HERMES BYTECODE PATCHER")
    print("="*70)
    print(f"Target credits: {target_credits}")
    print(f"Enable plus plan: Yes")
    print("="*70)
    print()
    
    count = patch_bundle(input_file, output_file, target_credits)
    
    print(f"\n📦 Patched bundle: {output_file}")
    print("⚠️  Test before deployment!\n")
    
    return 0 if count > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
