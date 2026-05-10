import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/patient/patient_bloc.dart';
import 'blocs/analysis/analysis_cubit.dart';
import 'services/clinical_intelligence_service.dart';
import 'services/local_intelligence_service.dart';
import 'services/export_service.dart';
import 'screens/home_screen.dart';
import 'screens/splash_screen.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    final localAI = LocalIntelligenceService();
    
    try {
      // Add a timeout to prevent initialization from hanging the entire app
      await localAI.initialize().timeout(
        const Duration(seconds: 5),
        onTimeout: () => print('Local AI initialization timed out.'),
      );
    } catch (e) {
      print('Critical error during Local AI initialization: $e');
    }
    
    runApp(PocketGullApp(localAI: localAI));
  }, (error, stack) {
    print('GLOBAL ERROR: $error');
    print(stack);
  });
}

class PocketGullApp extends StatelessWidget {
  final LocalIntelligenceService localAI;
  const PocketGullApp({super.key, required this.localAI});

  @override
  Widget build(BuildContext context) {
    // Note: In production, pass this via --dart-define or environment variables
    const apiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'YOUR_API_KEY_HERE');

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ClinicalIntelligenceService>(
          create: (_) => ClinicalIntelligenceService(apiKey: apiKey),
        ),
        RepositoryProvider<LocalIntelligenceService>.value(
          value: localAI,
        ),
        RepositoryProvider<ExportService>(
          create: (_) => ExportService(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<PatientBloc>(create: (context) => PatientBloc()),
          BlocProvider<AnalysisCubit>(
            create: (context) => AnalysisCubit(context.read<ClinicalIntelligenceService>()),
          ),
        ],
        child: MaterialApp(
          title: 'Pocket Gull',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            brightness: Brightness.light,
            primaryColor: const Color(0xFF1A1A1A),
            scaffoldBackgroundColor: const Color(0xFFF9F9F9),
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF1A1A1A),
              secondary: Color(0xFFE2E2E2),
              surface: Colors.white,
            ),
            fontFamily: 'Inter',
            useMaterial3: true,
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            primaryColor: Colors.white,
            scaffoldBackgroundColor: const Color(0xFF121212),
            colorScheme: const ColorScheme.dark(
              primary: Colors.white,
              secondary: Color(0xFF333333),
              surface: Color(0xFF1E1E1E),
            ),
            fontFamily: 'Inter',
            useMaterial3: true,
          ),
          themeMode: ThemeMode.system,
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
