import 'package:flutter/material.dart';
import 'package:provider_app/features/dashboard/screens/provider_dashboard.dart';

void main() {
  runApp(const ProviderApp());
}

class ProviderApp extends StatelessWidget {
  const ProviderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pocket Gull - Provider',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1C1C1C)),
        useMaterial3: true,
      ),
      darkTheme: ThemeData.dark(useMaterial3: true).copyWith(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1C1C1C),
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
      home: const ProviderDashboard(),
    );
  }
}
