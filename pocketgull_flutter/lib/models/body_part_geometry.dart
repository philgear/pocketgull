import 'package:vector_math/vector_math_64.dart';

class BodyPartGeometry {
  final String id;
  final String label;
  final Vector3 center;
  final double width;
  final double height;
  final double depth;

  const BodyPartGeometry({
    required this.id,
    required this.label,
    required this.center,
    required this.width,
    required this.height,
    required this.depth,
  });

  /// Anatomically contoured regions for 3D mapping
  static List<BodyPartGeometry> getMannequinParts() {
    return [
      BodyPartGeometry(id: 'head', label: 'Head & Cranium', center: Vector3(0, 1.75, 0), width: 0.42, height: 0.45, depth: 0.42),
      BodyPartGeometry(id: 'neck', label: 'Cervical Spine', center: Vector3(0, 1.48, 0), width: 0.20, height: 0.16, depth: 0.20),
      BodyPartGeometry(id: 'chest', label: 'Thoracic Ribcage', center: Vector3(0, 1.22, 0), width: 0.54, height: 0.40, depth: 0.32),
      BodyPartGeometry(id: 'abdomen', label: 'Abdominal Wall', center: Vector3(0, 0.92, 0), width: 0.44, height: 0.28, depth: 0.28),
      BodyPartGeometry(id: 'pelvis', label: 'Pelvic Girdle', center: Vector3(0, 0.68, 0), width: 0.48, height: 0.26, depth: 0.30),
      
      // Upper Limbs
      BodyPartGeometry(id: 'r_shoulder', label: 'Right Shoulder Joint', center: Vector3(-0.36, 1.36, 0), width: 0.22, height: 0.22, depth: 0.22),
      BodyPartGeometry(id: 'r_arm', label: 'Right Humerus & Arm', center: Vector3(-0.46, 1.05, 0), width: 0.16, height: 0.48, depth: 0.16),
      BodyPartGeometry(id: 'r_hand', label: 'Right Hand & Carpus', center: Vector3(-0.52, 0.72, 0), width: 0.12, height: 0.18, depth: 0.08),

      BodyPartGeometry(id: 'l_shoulder', label: 'Left Shoulder Joint', center: Vector3(0.36, 1.36, 0), width: 0.22, height: 0.22, depth: 0.22),
      BodyPartGeometry(id: 'l_arm', label: 'Left Humerus & Arm', center: Vector3(0.46, 1.05, 0), width: 0.16, height: 0.48, depth: 0.16),
      BodyPartGeometry(id: 'l_hand', label: 'Left Hand & Carpus', center: Vector3(0.52, 0.72, 0), width: 0.12, height: 0.18, depth: 0.08),

      // Lower Limbs
      BodyPartGeometry(id: 'r_thigh', label: 'Right Femur & Thigh', center: Vector3(-0.19, 0.32, 0), width: 0.22, height: 0.52, depth: 0.22),
      BodyPartGeometry(id: 'r_shin', label: 'Right Tibia & Calf', center: Vector3(-0.19, -0.28, 0), width: 0.18, height: 0.54, depth: 0.18),
      BodyPartGeometry(id: 'r_foot', label: 'Right Foot & Ankle', center: Vector3(-0.19, -0.62, 0.10), width: 0.14, height: 0.12, depth: 0.32),

      BodyPartGeometry(id: 'l_thigh', label: 'Left Femur & Thigh', center: Vector3(0.19, 0.32, 0), width: 0.22, height: 0.52, depth: 0.22),
      BodyPartGeometry(id: 'l_shin', label: 'Left Tibia & Calf', center: Vector3(0.19, -0.28, 0), width: 0.18, height: 0.54, depth: 0.18),
      BodyPartGeometry(id: 'l_foot', label: 'Left Foot & Ankle', center: Vector3(0.19, -0.62, 0.10), width: 0.14, height: 0.12, depth: 0.32),
    ];
  }
}
