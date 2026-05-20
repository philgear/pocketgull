import os

parts = [
    # id, width, height, depth, x, y, z, rx, ry, rz
    ('head', 0.45, 0.45, 0.45, 0, 1.75, 0, 0, 0, 0),
    ('neck', 0.15, 0.15, 0.15, 0, 1.55, 0, 0, 0, 0),
    ('chest', 0.5, 0.45, 0.3, 0, 1.3, 0, 0, 0, 0),
    ('abdomen', 0.45, 0.3, 0.28, 0, 0.95, 0, 0, 0, 0),
    ('pelvis', 0.48, 0.25, 0.3, 0, 0.7, 0, 0, 0, 0),
    
    ('r_shoulder', 0.2, 0.2, 0.2, -0.32, 1.45, 0, 0, 0, 0),
    ('r_arm', 0.1, 0.5, 0.1, -0.42, 1.15, 0.05, 0.1, 0, 0),
    ('r_hand', 0.08, 0.15, 0.05, -0.5, 0.82, 0, 0.2, 0, 0),
    
    ('l_shoulder', 0.2, 0.2, 0.2, 0.32, 1.45, 0, 0, 0, 0),
    ('l_arm', 0.1, 0.5, 0.1, 0.42, 1.15, 0.05, 0.1, 0, 0),
    ('l_hand', 0.08, 0.15, 0.05, 0.5, 0.82, 0, 0.2, 0, 0),
    
    ('r_thigh', 0.2, 0.6, 0.2, -0.18, 0.35, 0, 0, 0, 0),
    ('r_shin', 0.15, 0.6, 0.15, -0.18, -0.25, 0, 0, 0, 0),
    ('r_foot', 0.15, 0.08, 0.25, -0.18, -0.58, 0.05, 0, 0, 0),
    
    ('l_thigh', 0.2, 0.6, 0.2, 0.18, 0.35, 0, 0, 0, 0),
    ('l_shin', 0.15, 0.6, 0.15, 0.18, -0.25, 0, 0, 0, 0),
    ('l_foot', 0.15, 0.08, 0.25, 0.18, -0.58, 0.05, 0, 0, 0),
]

import math

def rotate_x(p, angle):
    y = p[1] * math.cos(angle) - p[2] * math.sin(angle)
    z = p[1] * math.sin(angle) + p[2] * math.cos(angle)
    return (p[0], y, z)

def rotate_y(p, angle):
    x = p[0] * math.cos(angle) + p[2] * math.sin(angle)
    z = -p[0] * math.sin(angle) + p[2] * math.cos(angle)
    return (x, p[1], z)

def rotate_z(p, angle):
    x = p[0] * math.cos(angle) - p[1] * math.sin(angle)
    y = p[0] * math.sin(angle) + p[1] * math.cos(angle)
    return (x, y, p[2])

def create_box(name, w, h, d, cx, cy, cz, rx, ry, rz, start_idx):
    # Vertices relative to origin
    verts = [
        (-w/2, -h/2, d/2),
        (w/2, -h/2, d/2),
        (-w/2, h/2, d/2),
        (w/2, h/2, d/2),
        (-w/2, -h/2, -d/2),
        (w/2, -h/2, -d/2),
        (-w/2, h/2, -d/2),
        (w/2, h/2, -d/2)
    ]
    
    out_verts = []
    for v in verts:
        v = rotate_x(v, rx)
        v = rotate_y(v, ry)
        v = rotate_z(v, rz)
        out_verts.append((v[0]+cx, v[1]+cy, v[2]+cz))
        
    faces = [
        # front
        (1, 2, 4, 3),
        # back
        (6, 5, 7, 8),
        # left
        (5, 1, 3, 7),
        # right
        (2, 6, 8, 4),
        # top
        (3, 4, 8, 7),
        # bottom
        (5, 6, 2, 1)
    ]
    
    obj_str = f"o {name}\n"
    for v in out_verts:
        obj_str += f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n"
        
    for f in faces:
        obj_str += f"f {f[0]+start_idx} {f[1]+start_idx} {f[2]+start_idx} {f[3]+start_idx}\n"
        
    return obj_str, start_idx + 8

os.makedirs('assets/models', exist_ok=True)
with open('assets/models/mannequin.obj', 'w') as f:
    f.write("# Mannequin OBJ\n")
    start_idx = 0
    for part in parts:
        name, w, h, d, cx, cy, cz, rx, ry, rz = part
        obj_str, start_idx = create_box(name, w, h, d, cx, cy, cz, rx, ry, rz, start_idx)
        f.write(obj_str)
