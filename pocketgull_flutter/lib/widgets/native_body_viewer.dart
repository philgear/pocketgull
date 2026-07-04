import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ditredi/ditredi.dart';
import 'package:vector_math/vector_math_64.dart' as v;
import '../providers/patient_provider.dart';
import '../models/body_part_geometry.dart';
import '../models/patient_types.dart';

class NativeBodyViewer extends ConsumerStatefulWidget {
  final PatientState? staticPatient;
  final bool interactive;

  const NativeBodyViewer({
    super.key,
    this.staticPatient,
    this.interactive = true,
  });

  @override
  ConsumerState<NativeBodyViewer> createState() => _NativeBodyViewerState();
}

class _NativeBodyViewerState extends ConsumerState<NativeBodyViewer> {
  final _controller = DiTreDiController(
    rotationX: 0,
    rotationY: 180,
    light: v.Vector3(-0.5, -1.0, 0.5),
  );

  @override
  Widget build(BuildContext context) {
    if (widget.staticPatient != null) {
      return _buildViewer(context, widget.staticPatient!);
    }

    final state = ref.watch(patientProvider);
    return _buildViewer(context, state);
  }

  Widget _buildViewer(BuildContext context, PatientState state) {
    final figures = _buildFigures(state);
    
    return GestureDetector(
      onPanUpdate: widget.interactive ? (details) {
        setState(() {
          _controller.rotationX -= details.delta.dy;
          _controller.rotationY += details.delta.dx;
        });
      } : null,
      onTapDown: widget.interactive ? (details) {
        final height = context.size?.height ?? 1.0;
        final width = context.size?.width ?? 1.0;
        final normalizedY = details.localPosition.dy / height;
        final normalizedX = details.localPosition.dx / width;
        
        // Accurate 2D bounding box mapping (assuming default rotation/front facing)
        String partId = 'chest';
        
        if (normalizedY < 0.25) {
          partId = 'head';
        } else if (normalizedY < 0.55) {
          if (normalizedX < 0.35) {
            partId = 'r_arm';
          } else if (normalizedX > 0.65) {
            partId = 'l_arm';
          } else {
            partId = 'chest';
          }
        } else if (normalizedY < 0.65) {
          if (normalizedX < 0.35) {
            partId = 'r_hand';
          } else if (normalizedX > 0.65) {
            partId = 'l_hand';
          } else {
            partId = 'abdomen';
          }
        } else if (normalizedY < 0.75) {
          partId = 'pelvis';
        } else if (normalizedY < 0.9) {
          if (normalizedX < 0.5) {
            partId = 'r_thigh';
          } else {
            partId = 'l_thigh';
          }
        } else {
          if (normalizedX < 0.5) {
            partId = 'r_shin';
          } else {
            partId = 'l_shin';
          }
        }
        
        debugPrint('3D Selection: $partId (X: $normalizedX, Y: $normalizedY)');
        ref.read(patientProvider.notifier).selectPart(partId);
      } : null,
      child: Container(
        color: const Color(0xFFF9FAFB),
        child: DiTreDi(
          figures: figures,
          controller: _controller,
        ),
      ),
    );
  }

  List<Model3D> _buildFigures(PatientState state) {
    final parts = BodyPartGeometry.getMannequinParts();
    final figures = <Model3D>[];
    
    for (var part in parts) {
      final color = _getPartColor(part.id, state);
      
      final v1 = v.Vector3(part.center.x - part.width / 2, part.center.y - part.height / 2, part.center.z - part.depth / 2);
      final v2 = v.Vector3(part.center.x + part.width / 2, part.center.y - part.height / 2, part.center.z - part.depth / 2);
      final v3 = v.Vector3(part.center.x + part.width / 2, part.center.y - part.height / 2, part.center.z + part.depth / 2);
      final v4 = v.Vector3(part.center.x - part.width / 2, part.center.y - part.height / 2, part.center.z + part.depth / 2);
      final v5 = v.Vector3(part.center.x - part.width / 2, part.center.y + part.height / 2, part.center.z - part.depth / 2);
      final v6 = v.Vector3(part.center.x + part.width / 2, part.center.y + part.height / 2, part.center.z - part.depth / 2);
      final v7 = v.Vector3(part.center.x + part.width / 2, part.center.y + part.height / 2, part.center.z + part.depth / 2);
      final v8 = v.Vector3(part.center.x - part.width / 2, part.center.y + part.height / 2, part.center.z + part.depth / 2);

      figures.add(Mesh3D([
        // bottom
        Face3D(v.Triangle.points(v1, v2, v3), color: color),
        Face3D(v.Triangle.points(v1, v3, v4), color: color),
        // top
        Face3D(v.Triangle.points(v5, v6, v7), color: color),
        Face3D(v.Triangle.points(v5, v7, v8), color: color),
        // front
        Face3D(v.Triangle.points(v1, v2, v6), color: color),
        Face3D(v.Triangle.points(v1, v6, v5), color: color),
        // back
        Face3D(v.Triangle.points(v3, v4, v8), color: color),
        Face3D(v.Triangle.points(v3, v8, v7), color: color),
        // left
        Face3D(v.Triangle.points(v1, v4, v8), color: color),
        Face3D(v.Triangle.points(v1, v8, v5), color: color),
        // right
        Face3D(v.Triangle.points(v2, v3, v7), color: color),
        Face3D(v.Triangle.points(v2, v7, v6), color: color),
      ]));
    }
    
    return figures;
  }

  Color _getPartColor(String partId, PatientState state) {
    if (state.selectedPartId == partId) {
      return Colors.blue.withValues(alpha: 0.8);
    }

    final issues = state.issues[partId];
    int maxPain = 0;
    bool hasEscalation = false;
    
    if (issues != null && issues.isNotEmpty) {
      maxPain = issues.map((i) => i.painLevel).reduce((a, b) => a > b ? a : b);
      hasEscalation = issues.any((i) => i.escalationFlag || i.trajectory == 'rapidly_escalating');
    }

    // High Priority Escalation Override
    if (hasEscalation) {
       // Deep crimson red to indicate urgent escalation across all view modes
       return const Color(0xFF991B1B).withValues(alpha: 0.95);
    }

    switch (state.viewMode) {
      case AnatomicalViewMode.orthomolecular:
        // Orthomolecular: Cyan/Green base, Magenta/Purple for metabolic stress
        if (maxPain >= 7) return Colors.purpleAccent.shade400.withValues(alpha: 0.9);
        if (maxPain >= 4) return Colors.deepPurple.shade300.withValues(alpha: 0.8);
        return Colors.tealAccent.shade700.withValues(alpha: 0.6);

      case AnatomicalViewMode.muscular:
        // Muscular: Crimson base, Cyan for oxygen deprivation/injury
        if (maxPain >= 7) return Colors.cyanAccent.shade400.withValues(alpha: 0.9);
        if (maxPain >= 4) return Colors.blue.shade300.withValues(alpha: 0.8);
        return Colors.red.shade900.withValues(alpha: 0.8);

      case AnatomicalViewMode.skeletal:
        // Skeletal: Bone white base, Orange/Yellow for structural stress
        if (maxPain >= 7) return Colors.deepOrange.shade600.withValues(alpha: 0.9);
        if (maxPain >= 4) return Colors.orangeAccent.shade200.withValues(alpha: 0.8);
        return const Color(0xFFF1F0EA).withValues(alpha: 0.9);

      case AnatomicalViewMode.vascular:
        // Vascular: Blue/Red mix base, glowing Yellow/White for leak/hemorrhage
        if (maxPain >= 7) return Colors.yellowAccent.shade400.withValues(alpha: 0.9);
        if (maxPain >= 4) return Colors.amber.shade200.withValues(alpha: 0.8);
        return const Color(0xFF4A148C).withValues(alpha: 0.7); // Deep purple-blue for veins/arteries

      case AnatomicalViewMode.standard:
        // Standard: White base, Red/Orange for general pain
        if (maxPain >= 7) return Colors.red.withValues(alpha: 0.8);
        if (maxPain >= 4) return Colors.orange.withValues(alpha: 0.8);
        if (maxPain > 0) return Colors.yellow.withValues(alpha: 0.8);
        return Colors.white.withValues(alpha: 0.9);
    }
  }
}
