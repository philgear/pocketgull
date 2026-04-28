import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/patient/patient_bloc.dart';
import 'blocs/analysis/analysis_cubit.dart';
import 'services/clinical_intelligence_service.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const PocketGullApp());
}

class PocketGullApp extends StatelessWidget {
  const PocketGullApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Note: In production, pass this via --dart-define or environment variables
    const apiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'YOUR_API_KEY_HERE');

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ClinicalIntelligenceService>(
          create: (_) => ClinicalIntelligenceService(apiKey: apiKey),
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
        theme: ThemeData(
          brightness: Brightness.light,
          primaryColor: const Color(0xFF1A1A1A),
          scaffoldBackgroundColor: const Color(0xFFF9F9F9),
          colorScheme: const ColorScheme.light(
            primary: Color(0xFF1A1A1A),
            secondary: Color(0xFFE2E2E2),
            background: Color(0xFFF9F9F9),
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
            background: Color(0xFF121212),
            surface: Color(0xFF1E1E1E),
          ),
          fontFamily: 'Inter',
          useMaterial3: true,
        ),
        themeMode: ThemeMode.system,
        home: const HomeScreen(),
      ),
    ));
  }
}
