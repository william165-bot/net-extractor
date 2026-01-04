#!/usr/bin/env python3
"""
Brute Force Patcher - Replaces all potential credit values
WARNING: This is aggressive and may affect non-credit values
Use for testing only!
"""

import sys
import struct

def brute_force_patch(input_file, output_file, target_credits=7000):
    """
    Aggressively patch all small integers that could be credit values
    """
    print("="*70)
    print("BRUTE FORCE HERMES BYTECODE PATCHER")
    print("="*70)
    print("WARNING: This patches ALL matching values, not just credits!")
    print("Only use for testing purposes!")
    print("="*70)
    print()
    
    with open(input_file, 'rb') as f:
        data = bytearray(f.read())
    
    print(f"Original size: {len(data):,} bytes\n")
    
    # Values that are common credit limits in free/paid tiers
    values_to_replace = {
        100: "100 (common free tier daily)",
        500: "500 (common free tier total)",
        1000: "1000 (basic tier)",
        1500: "1500 (intermediate tier)",
        2000: "2000 (pro tier)",
        5000: "5000 (premium tier)",
    }
    
    total_replacements = 0
    
    for old_value, description in values_to_replace.items():
        print(f"Replacing {old_value} -> {target_credits} ({description})")
        
        # 32-bit little-endian
        pattern_32 = struct.pack('<I', old_value)
        count_32 = 0
        offset = 0
        while True:
            pos = data.find(pattern_32, offset)
            if pos == -1:
                break
            struct.pack_into('<I', data, pos, target_credits)
            count_32 += 1
            offset = pos + 4
        
        # 16-bit little-endian
        if old_value <= 65535:
            pattern_16 = struct.pack('<H', old_value)
            count_16 = 0
            offset = 0
            while True:
                pos = data.find(pattern_16, offset)
                if pos == -1:
                    break
                # Only replace if it looks like a standalone value
                # Check it's not part of a larger number
                if pos + 2 < len(data):
                    # If next 2 bytes are not part of a 32-bit int
                    if pos >= 2 and data[pos-2:pos] == b'\x00\x00':
                        struct.pack_into('<H', data, pos, min(target_credits, 65535))
                        count_16 += 1
                offset = pos + 2
        else:
            count_16 = 0
        
        total = count_32 + count_16
        total_replacements += total
        print(f"  Replaced {total} occurrences (32-bit: {count_32}, 16-bit: {count_16})")
    
    # Also patch boolean returns related to credit checks
    print("\nPatching LoadConstFalse -> LoadConstTrue...")
    false_to_true = 0
    for i in range(len(data) - 1):
        # Pattern: LoadConstFalse (0x0A) followed eventually by Ret
        if data[i] == 0x0A:  # LoadConstFalse
            # Check next few bytes for Ret
            for j in range(i+1, min(i+10, len(data))):
                if data[j] in [0x2E, 0x2F]:  # Ret opcodes
                    # Likely a "return false" pattern
                    data[i] = 0x09  # Change to LoadConstTrue
                    false_to_true += 1
                    break
    
    print(f"  Patched {false_to_true} boolean returns")
    total_replacements += false_to_true
    
    # Write output
    with open(output_file, 'wb') as f:
        f.write(data)
    
    print(f"\n{'='*70}")
    print(f"TOTAL PATCHES APPLIED: {total_replacements}")
    print(f"{'='*70}")
    print(f"\nOutput: {output_file}")
    print(f"Size: {len(data):,} bytes")
    print("\n⚠️  TEST THOROUGHLY - This modifies many values!")
    
    return total_replacements

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 brute_patcher.py <input> <output> [credits]")
        print("Example: python3 brute_patcher.py input.bundle output.bundle 7000")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_credits = int(sys.argv[3]) if len(sys.argv) > 3 else 7000
    
    count = brute_force_patch(input_file, output_file, target_credits)
    
    if count > 0:
        print(f"\n✅ Successfully applied {count} patches!")
    else:
        print(f"\n⚠️  No patches applied")
    
    sys.exit(0 if count > 0 else 1)
