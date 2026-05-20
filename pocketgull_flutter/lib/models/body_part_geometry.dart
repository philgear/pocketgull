import 'package:vector_math/vector_math_64.dart';

class BodyPartGeometry {
  final String id;
  final double width;
  final double height;
  final double depth;
  final Vector3 center;
  final Vector3 rotation;

  const BodyPartGeometry({
    required this.id,
    required this.width,
    required this.height,
    required this.depth,
    required this.center,
    required this.rotation,
  });

  static List<BodyPartGeometry> getMannequinParts() {
    return [
      BodyPartGeometry(
        id: 'head',
        width: 0.45, height: 0.45, depth: 0.45,
        center: Vector3(0, 1.75, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'neck',
        width: 0.15, height: 0.15, depth: 0.15,
        center: Vector3(0, 1.55, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'chest',
        width: 0.5, height: 0.45, depth: 0.3,
        center: Vector3(0, 1.3, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'abdomen',
        width: 0.45, height: 0.3, depth: 0.28,
        center: Vector3(0, 0.95, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'pelvis',
        width: 0.48, height: 0.25, depth: 0.3,
        center: Vector3(0, 0.7, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_shoulder',
        width: 0.2, height: 0.2, depth: 0.2,
        center: Vector3(-0.32, 1.45, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_arm',
        width: 0.1, height: 0.5, depth: 0.1,
        center: Vector3(-0.42, 1.15, 0.05),
        rotation: Vector3(0.1, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_hand',
        width: 0.08, height: 0.15, depth: 0.05,
        center: Vector3(-0.5, 0.82, 0),
        rotation: Vector3(0.2, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_shoulder',
        width: 0.2, height: 0.2, depth: 0.2,
        center: Vector3(0.32, 1.45, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_arm',
        width: 0.1, height: 0.5, depth: 0.1,
        center: Vector3(0.42, 1.15, 0.05),
        rotation: Vector3(0.1, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_hand',
        width: 0.08, height: 0.15, depth: 0.05,
        center: Vector3(0.5, 0.82, 0),
        rotation: Vector3(0.2, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_thigh',
        width: 0.2, height: 0.6, depth: 0.2,
        center: Vector3(-0.18, 0.35, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_shin',
        width: 0.15, height: 0.6, depth: 0.15,
        center: Vector3(-0.18, -0.25, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'r_foot',
        width: 0.15, height: 0.08, depth: 0.25,
        center: Vector3(-0.18, -0.58, 0.05),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_thigh',
        width: 0.2, height: 0.6, depth: 0.2,
        center: Vector3(0.18, 0.35, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_shin',
        width: 0.15, height: 0.6, depth: 0.15,
        center: Vector3(0.18, -0.25, 0),
        rotation: Vector3(0, 0, 0),
      ),
      BodyPartGeometry(
        id: 'l_foot',
        width: 0.15, height: 0.08, depth: 0.25,
        center: Vector3(0.18, -0.58, 0.05),
        rotation: Vector3(0, 0, 0),
      ),
    ];
  }
}
