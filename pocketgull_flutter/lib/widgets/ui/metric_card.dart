import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../theme/app_colors.dart';

class MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final double? trend;
  final String? trendSuffix;
  final VoidCallback? onTap;

  const MetricCard({
    super.key,
    required this.title,
    required this.value,
    this.trend,
    this.trendSuffix = '%',
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Determine trend color and arrow
    Color trendColor = AppColors.gray500;
    String trendIcon = '';
    if (trend != null) {
      if (trend! > 0) {
        trendColor = AppColors.green600;
        trendIcon = '↑';
      } else if (trend! < 0) {
        trendColor = AppColors.red600;
        trendIcon = '↓';
      }
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.gray400 : AppColors.gray500,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.gray50 : AppColors.gray900,
                  ),
                ),
                if (trend != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    '$trendIcon ${trend!.abs()}$trendSuffix',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: trendColor,
                    ),
                  ).animate().fadeIn().slideX(begin: 0.1),
                ]
              ],
            ),
          ],
        ),
      ).animate(target: onTap != null ? 1 : 0)
       .tint(color: AppColors.primary.withValues(alpha: 0.05))
       .scaleXY(end: 1.02, duration: 200.ms, curve: Curves.easeOut),
    );
  }
}
