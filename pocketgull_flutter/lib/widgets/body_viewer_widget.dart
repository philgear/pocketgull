import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/patient/patient_event.dart';
import '../models/patient_types.dart';

class BodyViewerWidget extends StatefulWidget {
  const BodyViewerWidget({super.key});

  @override
  State<BodyViewerWidget> createState() => _BodyViewerWidgetState();
}

class _BodyViewerWidgetState extends State<BodyViewerWidget> {
  late final WebViewController _controller;
  bool _isWebViewReady = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() {
              _isWebViewReady = true;
            });
            _syncViewerState(context.read<PatientBloc>().state);
          },
        ),
      )
      ..addJavaScriptChannel(
        'PocketGullChannel',
        onMessageReceived: (JavaScriptMessage message) {
          try {
            final data = jsonDecode(message.message);
            if (data['id'] != null) {
              context.read<PatientBloc>().add(SelectPartEvent(data['id']));
            }
          } catch (e) {
            print("Failed to parse message from 3D Viewer: $e");
          }
        },
      );

    _loadHtmlAsset();
  }

  Future<void> _loadHtmlAsset() async {
    final htmlString = await rootBundle.loadString('assets/3d_viewer/index.html');
    _controller.loadHtmlString(htmlString);
  }

  void _syncViewerState(PatientState state) {
    if (!_isWebViewReady) return;
    
    // Construct the issues map for the viewer
    // We only need the max pain level per part
    final issuesMap = <String, dynamic>{};
    state.issues.forEach((partId, issues) {
      issuesMap[partId] = issues.map((i) => {'painLevel': i.painLevel}).toList();
    });

    final stateUpdate = {
      'type': 'UPDATE_STATE',
      'selectedId': state.selectedPartId,
      'issues': issuesMap,
      'isInternal': false, // Can be hooked up to a toggle later
    };

    final jsonState = jsonEncode(stateUpdate);
    _controller.runJavaScript("if (window.updateViewerState) window.updateViewerState('$jsonState');");
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PatientBloc, PatientState>(
      listener: (context, state) {
        _syncViewerState(state);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border(right: BorderSide(color: Theme.of(context).dividerColor)),
        ),
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
