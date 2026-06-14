import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/patient/patient_bloc.dart';
import 'blocs/analysis/analysis_cubit.dart';
import 'services/clinical_intelligence_service.dart';
import 'services/local_intelligence_service.dart';
import 'services/orcid_service.dart';
import 'services/export_service.dart';
import 'screens/splash_screen.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  await Firebase.initializeApp();
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // Note: Uncomment after running 'flutterfire configure'
    /*
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      
      final token = await messaging.getToken();
      print("FCM Token: $token");
    } catch (e) {
      print("Firebase Initialization Error: $e");
      print("Note: You must run 'flutterfire configure' to generate native config files.");
    }
    */
    debugPrint("Firebase initialization skipped. Run 'flutterfire configure' first.");
    
    // Initialize Hive local offline database
    await Hive.initFlutter();
    await Hive.openBox('pocket_gull_db');

    final localAI = LocalIntelligenceService();
    
    try {
      // Add a timeout to prevent initialization from hanging the entire app
      await localAI.initialize().timeout(
        const Duration(seconds: 5),
        onTimeout: () => debugPrint('Local AI initialization timed out.'),
      );
    } catch (e) {
      debugPrint('Critical error during Local AI initialization: $e');
    }

    final orcidService = OrcidService();
    await orcidService.initialize();
    
    runApp(PocketGullApp(localAI: localAI, orcidService: orcidService));
  }, (error, stack) {
    debugPrint('GLOBAL ERROR: $error');
    debugPrint(stack.toString());
  });
}

class PocketGullApp extends StatelessWidget {
  final LocalIntelligenceService localAI;
  final OrcidService orcidService;
  const PocketGullApp({super.key, required this.localAI, required this.orcidService});

  @override
  Widget build(BuildContext context) {
    // Note: In production, pass this via --dart-define or environment variables
    const apiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'YOUR_API_KEY_HERE');

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ClinicalIntelligenceService>(
          create: (_) => ClinicalIntelligenceService(apiKey: apiKey),
        ),
        RepositoryProvider<OrcidService>.value(
          value: orcidService,
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
