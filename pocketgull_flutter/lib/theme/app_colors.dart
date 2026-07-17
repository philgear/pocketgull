import 'package:flutter/material.dart';

/// Tailwind-mirrored color palette for PocketGull Flutter
class AppColors {
  // Brand Blue
  static const Color blue50 = Color(0xFFEFF6FF);
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue200 = Color(0xFFBFDBFE);
  static const Color blue300 = Color(0xFF93C5FD);
  static const Color blue400 = Color(0xFF60A5FA);
  static const Color blue500 = Color(0xFF4285F4); // Google Blue
  static const Color blue600 = Color(0xFF2563EB);
  static const Color blue700 = Color(0xFF1D4ED8);
  static const Color blue800 = Color(0xFF1E40AF);
  static const Color blue900 = Color(0xFF1E3A8A);
  static const Color blue950 = Color(0xFF172554);

  // Brand Red
  static const Color red50 = Color(0xFFFEF2F2);
  static const Color red100 = Color(0xFFFEE2E2);
  static const Color red200 = Color(0xFFFECACA);
  static const Color red300 = Color(0xFFFCA5A5);
  static const Color red400 = Color(0xFFF87171);
  static const Color red500 = Color(0xFFEA4335); // Google Red
  static const Color red600 = Color(0xFFDC2626);
  static const Color red700 = Color(0xFFB91C1C);
  static const Color red800 = Color(0xFF991B1B);
  static const Color red900 = Color(0xFF7F1D1D);
  static const Color red950 = Color(0xFF450A0A);

  // Brand Amber
  static const Color amber50 = Color(0xFFFEFCE8);
  static const Color amber100 = Color(0xFFFEF9C3);
  static const Color amber200 = Color(0xFFFEF08A);
  static const Color amber300 = Color(0xFFFDE047);
  static const Color amber400 = Color(0xFFFACC15);
  static const Color amber500 = Color(0xFFFBBC05); // Google Yellow
  static const Color amber600 = Color(0xFFCA8A04);
  static const Color amber700 = Color(0xFFA16207);
  static const Color amber800 = Color(0xFF854D0E);
  static const Color amber900 = Color(0xFF713F12);
  static const Color amber950 = Color(0xFF422006);

  // Brand Green
  static const Color green50 = Color(0xFFF0FDF4);
  static const Color green100 = Color(0xFFDCFCE7);
  static const Color green200 = Color(0xFFBBF7D0);
  static const Color green300 = Color(0xFF86EFAC);
  static const Color green400 = Color(0xFF4ADE80);
  static const Color green500 = Color(0xFF34A853); // Google Green
  static const Color green600 = Color(0xFF16A34A);
  static const Color green700 = Color(0xFF15803D);
  static const Color green800 = Color(0xFF166534);
  static const Color green900 = Color(0xFF14532D);
  static const Color green950 = Color(0xFF052E16);

  // Grays/Zinc for standard UI elements
  static const Color gray50 = Color(0xFFFAFAFA);
  static const Color gray100 = Color(0xFFF4F4F5);
  static const Color gray200 = Color(0xFFE4E4E7);
  static const Color gray300 = Color(0xFFD4D4D8);
  static const Color gray400 = Color(0xFFA1A1AA);
  static const Color gray500 = Color(0xFF71717A);
  static const Color gray600 = Color(0xFF52525B);
  static const Color gray700 = Color(0xFF3F3F46);
  static const Color gray800 = Color(0xFF27272A);
  static const Color gray900 = Color(0xFF18181B);
  static const Color gray950 = Color(0xFF09090B);

  // Semantic mappings
  static const Color primary = blue500;
  static const Color success = green500;
  static const Color warning = amber500;
  static const Color error = red500;
  
  // Surface colors
  static const Color backgroundLight = gray50;
  static const Color surfaceLight = Colors.white;
  static const Color borderLight = gray200;
  
  static const Color backgroundDark = gray950;
  static const Color surfaceDark = gray900;
  static const Color borderDark = gray800;
}
