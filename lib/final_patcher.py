#!/usr/bin/env python3
"""
Comprehensive HBC Patcher - Final Version
Uses multiple strategies to patch credits and subscription
"""

import sys
import struct
import os

def patch_numeric_values_near_strings(data, target_value=7000):
    """
    Find numeric values near credit-related strings and patch them
    This is the most reliable method for HBC patching
    """
    modified = bytearray(data)
    patches = []
    
    # Credit-related markers
    markers = {
        b"total": [],
        b"balance": [],
        b"credit": [],
        b"can_run": [],
        b"tier_credits": []
    }
    
    # Find all marker positions
    for marker in markers:
        offset = 0
        while True:
            pos = data.find(marker, offset)
            if pos == -1:
                break
            markers[marker].append(pos)
            offset = pos + 1
    
    print("Found markers:")
    for marker, positions in markers.items():
        print(f"  {marker.decode()}: {len(positions)} occurrences")
    
    # For each marker, search nearby for numeric values
    search_radius = 5000  # Search 5KB around each marker
    
    # Values that look like credit limits
    suspicious_values = [50, 100, 200, 500, 1000, 1500, 2000, 2500, 5000]
    
    patched_offsets = set()  # Avoid double-patching
    
    for marker, positions in markers.items():
        for pos in positions:
            search_start = max(0, pos - search_radius)
            search_end = min(len(data), pos + search_radius)
            
            # Search for 32-bit integers
            for i in range(search_start, search_end - 4):
                if i in patched_offsets:
                    continue
                
                # Try to read as 32-bit little-endian int
                try:
                    value = struct.unpack('<I', data[i:i+4])[0]
                    
                    # Check if this looks like a credit value
                    if value in suspicious_values:
                        # Patch it!
                        struct.pack_into('<I', modified, i, target_value)
                        patched_offsets.add(i)
                        patches.append({
                            'offset': hex(i),
                            'near_marker': marker.decode(),
                            'old_value': value,
                            'new_value': target_value,
                            'distance': abs(i - pos)
                        })
                except:
                    pass
    
    return bytes(modified), patches

def patch_boolean_logic(data):
    """
    Patch boolean return values in can_run checks
    """
    modified = bytearray(data)
    patches = []
    
    # Find can_run positions
    can_run = b"can_run"
    positions = []
    offset = 0
    while True:
        pos = data.find(can_run, offset)
        if pos == -1:
            break
        positions.append(pos)
        offset = pos + 1
    
    print(f"\nSearching near {len(positions)} can_run positions...")
    
    # Common HBC opcode patterns for boolean logic
    # LoadConstFalse = 0x0A, LoadConstTrue = 0x09
    # JmpFalse = various, Ret = 0x2E/0x2F
    
    for pos in positions:
        search_start = pos
        search_end = min(len(data), pos + 500)
        
        # Look for patterns like: LoadConstFalse; Ret
        for i in range(search_start, search_end - 1):
            if modified[i] == 0x0A:  # LoadConstFalse
                # Check if followed by Ret within 5 bytes
                for j in range(i+1, min(i+6, len(modified))):
                    if modified[j] in [0x2E, 0x2F]:  # Ret opcode
                        # This pattern likely returns false
                        # Patch to LoadConstTrue
                        modified[i] = 0x09
                        patches.append({
                            'offset': hex(i),
                            'type': 'LoadConstFalse -> LoadConstTrue',
                            'near': 'can_run'
                        })
                        break
    
    return bytes(modified), patches

def patch_subscription_strings(data):
    """
    Patch subscription tier strings
    """
    modified = bytearray(data)
    patches = []
    
    # Patch "free" to "plus" in tier contexts
    # Multiple possible formats
    patterns_to_find = [
        (b'\x00free\x00', b'\x00plus\x00'),
        (b'"free"', b'"plus"'),
        (b"'free'", b"'plus'"),
    ]
    
    for find_pattern, replace_pattern in patterns_to_find:
        offset = 0
        while True:
            pos = modified.find(find_pattern, offset)
            if pos == -1:
                break
            
            # Check if this is in a subscription context
            context_start = max(0, pos - 2000)
            context_end = min(len(data), pos + 2000)
            context = data[context_start:context_end]
            
            # Look for subscription indicators
            if any(marker in context for marker in [b"tier", b"subscription", b"kortix", b"plan"]):
                # Apply patch
                modified[pos:pos+len(replace_pattern)] = replace_pattern
                patches.append({
                    'offset': hex(pos),
                    'type': 'tier upgrade',
                    'change': 'free -> plus'
                })
                print(f"  ✓ Patched tier string at {hex(pos)}")
            
            offset = pos + 1
    
    return bytes(modified), patches

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 final_patcher.py <input> <output> [credits]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_credits = int(sys.argv[3]) if len(sys.argv) > 3 else 7000
    
    print("="*80)
    print("COMPREHENSIVE HERMES BYTECODE PATCHER")
    print("="*80)
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print(f"Target credits: {target_credits}")
    print(f"Enable plus: Yes")
    print("="*80)
    print()
    
    # Read file
    with open(input_file, 'rb') as f:
        data = f.read()
    
    print(f"Original size: {len(data):,} bytes\n")
    
    # Apply patches
    print("="*80)
    print("PHASE 1: Patching numeric credit values")
    print("="*80)
    data, numeric_patches = patch_numeric_values_near_strings(data, target_credits)
    print(f"Applied {len(numeric_patches)} numeric patches\n")
    
    print("="*80)
    print("PHASE 2: Patching boolean logic")
    print("="*80)
    data, bool_patches = patch_boolean_logic(data)
    print(f"Applied {len(bool_patches)} boolean patches\n")
    
    print("="*80)
    print("PHASE 3: Patching subscription tier strings")
    print("="*80)
    data, tier_patches = patch_subscription_strings(data)
    print(f"Applied {len(tier_patches)} tier patches\n")
    
    # Write output
    with open(output_file, 'wb') as f:
        f.write(data)
    
    # Summary
    total_patches = len(numeric_patches) + len(bool_patches) + len(tier_patches)
    
    print("="*80)
    print(f"PATCH SUMMARY - Total: {total_patches} patches")
    print("="*80)
    
    if numeric_patches:
        print(f"\nNumeric patches ({len(numeric_patches)}):")
        for i, patch in enumerate(numeric_patches[:20], 1):
            print(f"  {i}. [{patch['offset']}] {patch['old_value']} → {patch['new_value']} "
                  f"(near '{patch['near_marker']}', distance: {patch['distance']})")
        if len(numeric_patches) > 20:
            print(f"  ... and {len(numeric_patches) - 20} more")
    
    if bool_patches:
        print(f"\nBoolean patches ({len(bool_patches)}):")
        for patch in bool_patches:
            print(f"  [{patch['offset']}] {patch['type']}")
    
    if tier_patches:
        print(f"\nTier patches ({len(tier_patches)}):")
        for patch in tier_patches:
            print(f"  [{patch['offset']}] {patch['change']}")
    
    print("\n" + "="*80)
    if total_patches > 0:
        print(f"✅ SUCCESS: Applied {total_patches} patches to bundle")
    else:
        print("⚠️  WARNING: No patches applied - check bundle structure")
    print("="*80)
    
    print(f"\n📦 Output: {output_file}")
    print(f"📊 Size: {len(data):,} bytes")
    print("\n⚠️  IMPORTANT: Test thoroughly before deployment!")
    print("   This modifies bytecode directly - backup originals!\n")
    
    return 0 if total_patches > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
