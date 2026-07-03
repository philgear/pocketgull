import 'package:flutter/material.dart';

enum BadgeSeverity { info, success, warning, error, neutral }

class PocketGullBadgeWidget extends StatelessWidget {
  final String label;
  final BadgeSeverity severity;
  final Widget? icon;

  const PocketGullBadgeWidget({
    super.key,
    required this.label,
    this.severity = BadgeSeverity.neutral,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bgColor;
    Color borderColor;
    Color textColor;

    switch (severity) {
      case BadgeSeverity.info:
        bgColor = isDark
            ? const Color(0xFF1E88E5).withValues(alpha: 0.15)
            : const Color(0xFF1E88E5).withValues(alpha: 0.08);
        borderColor = isDark
            ? const Color(0xFF1E88E5).withValues(alpha: 0.3)
            : const Color(0xFF1E88E5).withValues(alpha: 0.15);
        textColor = isDark ? const Color(0xFF64B5F6) : const Color(0xFF1E88E5);
        break;
      case BadgeSeverity.success:
        bgColor = isDark
            ? const Color(0xFF689F38).withValues(alpha: 0.15)
            : const Color(0xFF689F38).withValues(alpha: 0.08);
        borderColor = isDark
            ? const Color(0xFF689F38).withValues(alpha: 0.3)
            : const Color(0xFF689F38).withValues(alpha: 0.15);
        textColor = isDark ? const Color(0xFFAED581) : const Color(0xFF558B2F);
        break;
      case BadgeSeverity.warning:
        bgColor = isDark
            ? const Color(0xFFFFB300).withValues(alpha: 0.15)
            : const Color(0xFFFFB300).withValues(alpha: 0.08);
        borderColor = isDark
            ? const Color(0xFFFFB300).withValues(alpha: 0.3)
            : const Color(0xFFFFB300).withValues(alpha: 0.15);
        textColor = isDark ? const Color(0xFFFFD54F) : const Color(0xFFFFB300);
        break;
      case BadgeSeverity.error:
        bgColor = isDark
            ? const Color(0xFFE53935).withValues(alpha: 0.15)
            : const Color(0xFFE53935).withValues(alpha: 0.08);
        borderColor = isDark
            ? const Color(0xFFE53935).withValues(alpha: 0.3)
            : const Color(0xFFE53935).withValues(alpha: 0.15);
        textColor = isDark ? const Color(0xFFE57373) : const Color(0xFFE53935);
        break;
      case BadgeSeverity.neutral:
        bgColor = isDark
            ? const Color(0xFFA1A1AA).withValues(alpha: 0.15)
            : const Color(0xFF6B7280).withValues(alpha: 0.08);
        borderColor = isDark
            ? const Color(0xFFA1A1AA).withValues(alpha: 0.3)
            : const Color(0xFF6B7280).withValues(alpha: 0.15);
        textColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF4B5563);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            icon!,
            const SizedBox(width: 4),
          ],
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: textColor,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }
}
