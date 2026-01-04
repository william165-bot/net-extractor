#!/usr/bin/env python3
"""
DEX Smali Patcher - Modify credit and pro plan values
"""

import os
import re

def patch_credit_methods(file_path):
    """Patch methods that return totalCredits to return 7000"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original = content
    patches = []
    
    # Pattern for credit getter methods (U()I and n()I)
    # Replace: iget v0, p0, LId/M;->c:I  with: const/16 v0, 0x1b58
    # 0x1b58 = 7000 in hex
    
    # Method U()I
    pattern1 = r'(\.method public final U\(\)I\s+\.registers 2\s+\.line 1\s+)iget v0, p0, LId/M;->c:I(\s+\.line 3\s+return v0)'
    replacement1 = r'\1const/16 v0, 0x1b58  # Patched: return 7000\2'
    
    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content)
        patches.append("Method U()I: return 7000")
    
    # Method n()I
    pattern2 = r'(\.method public final n\(\)I\s+\.registers 2\s+\.line 1\s+)iget v0, p0, LId/M;->c:I(\s+\.line 3\s+return v0)'
    replacement2 = r'\1const/16 v0, 0x1b58  # Patched: return 7000\2'
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        patches.append("Method n()I: return 7000")
    
    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        return patches
    return []

def patch_pro_methods(file_path):
    """Patch methods that return privilegeType to return 1 (pro)"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original = content
    patches = []
    
    # Pattern for privilegeType getter methods (Q()I and b()I)
    # Replace: iget v0, p0, LId/M;->b:I  with: const/4 v0, 0x1
    
    # Method Q()I
    pattern1 = r'(\.method public final Q\(\)I\s+\.registers 2\s+\.line 1\s+)iget v0, p0, LId/M;->b:I(\s+\.line 3\s+return v0)'
    replacement1 = r'\1const/4 v0, 0x1  # Patched: return 1 (pro)\2'
    
    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content)
        patches.append("Method Q()I: return 1 (pro)")
    
    # Method b()I
    pattern2 = r'(\.method public final b\(\)I\s+\.registers 2\s+\.line 1\s+)iget v0, p0, LId/M;->b:I(\s+\.line 3\s+return v0)'
    replacement2 = r'\1const/4 v0, 0x1  # Patched: return 1 (pro)\2'
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        patches.append("Method b()I: return 1 (pro)")
    
    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        return patches
    return []

def main():
    target_file = "/project/workspace/dex_smali/classes5/Id/M.smali"
    
    print("="*70)
    print("DEX SMALI PATCHER - Credits & Pro Plan")
    print("="*70)
    print(f"Target: {target_file}")
    print()
    
    # Patch credits
    print("Patching credit methods...")
    credit_patches = patch_credit_methods(target_file)
    for patch in credit_patches:
        print(f"  ✓ {patch}")
    
    # Patch pro plan
    print("\nPatching pro plan methods...")
    pro_patches = patch_pro_methods(target_file)
    for patch in pro_patches:
        print(f"  ✓ {patch}")
    
    total = len(credit_patches) + len(pro_patches)
    
    print(f"\n{'='*70}")
    print(f"TOTAL PATCHES APPLIED: {total}")
    print(f"{'='*70}")
    
    if total > 0:
        print("\n✅ Patching successful!")
        print("\nModifications:")
        print("  - Credits: Methods will return 7000")
        print("  - Pro Plan: Methods will return 1 (enabled)")
    else:
        print("\n⚠️  No patches applied - check file structure")
    
    return total

if __name__ == '__main__':
    result = main()
    exit(0 if result > 0 else 1)
