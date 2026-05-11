import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ditredi/ditredi.dart';
import 'package:vector_math/vector_math_64.dart' as v;
import '../blocs/patient/patient_bloc.dart';
import '../blocs/patient/patient_event.dart';
import '../models/body_part_geometry.dart';
import '../models/patient_types.dart';

class NativeBodyViewer extends StatefulWidget {
  final PatientState? staticPatient;
  final bool interactive;

  const NativeBodyViewer({
    super.key,
    this.staticPatient,
    this.interactive = true,
  });

  @override
  State<NativeBodyViewer> createState() => _NativeBodyViewerState();
}

class _NativeBodyViewerState extends State<NativeBodyViewer> {
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

    return BlocBuilder<PatientBloc, PatientState>(
      builder: (context, state) {
        return _buildViewer(context, state);
      },
    );
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
        final normalizedY = details.localPosition.dy / height;
        
        String partId;
        if (normalizedY < 0.35) {
          partId = 'head';
        } else if (normalizedY < 0.65) {
          partId = 'chest';
        } else {
          partId = 'legs';
        }
        
        print('3D Selection: $partId (Y: $normalizedY)');
        context.read<PatientBloc>().add(SelectPartEvent(partId));
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
    // 1. Highlight selected part
    if (state.selectedPartId == partId) {
      return Colors.blue.withValues(alpha: 0.8);
    }

    // 2. Color based on issues / pain level
    final issues = state.issues[partId];
    if (issues != null && issues.isNotEmpty) {
      // Get max pain level
      final maxPain = issues.map((i) => i.painLevel).reduce((a, b) => a > b ? a : b);
      if (maxPain >= 7) return Colors.red.withValues(alpha: 0.8);
      if (maxPain >= 4) return Colors.orange.withValues(alpha: 0.8);
      return Colors.yellow.withValues(alpha: 0.8);
    }

    // 3. Default color
    return Colors.white.withValues(alpha: 0.9);
  }
}
