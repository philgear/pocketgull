import 'dart:ui';
import 'package:flutter/material.dart';

class PocketGullCardWidget extends StatefulWidget {
  final String? title;
  final Widget? icon;
  final bool hasFooter;
  final bool noPadding;
  final Widget? rightAction;
  final Widget? footerChild;
  final Widget child;

  const PocketGullCardWidget({
    super.key,
    this.title,
    this.icon,
    this.hasFooter = false,
    this.noPadding = false,
    this.rightAction,
    this.footerChild,
    required this.child,
  });

  @override
  State<PocketGullCardWidget> createState() => _PocketGullCardWidgetState();
}

class _PocketGullCardWidgetState extends State<PocketGullCardWidget> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Colors
    final bgColor = isDark
        ? const Color(0xFF1E1E1E).withValues(alpha: 0.8)
        : Colors.white.withValues(alpha: 0.7);

    final borderColor = isDark
        ? (_isHovered ? const Color(0xFF3F3F46) : const Color(0xFF27272A))
        : (_isHovered ? const Color(0xFFE5E7EB) : Colors.white.withValues(alpha: 0.2));

    final shadowColor = isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.08);
    final shadowBlur = _isHovered ? 24.0 : 12.0;
    final shadowOffset = _isHovered ? const Offset(0, 8) : const Offset(0, 4);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor, width: 1),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: shadowBlur,
              offset: shadowOffset,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(11),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
            child: Container(
              color: bgColor,
              child: Stack(
                children: [
                  // Subtle top-right glow effect (simulating Angular's blur-3xl glow)
                  Positioned(
                    top: -96,
                    right: -96,
                    child: Container(
                      width: 192,
                      height: 192,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: (isDark ? const Color(0xFF8BC34A) : const Color(0xFF689F38))
                            .withValues(alpha: 0.05),
                      ),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
                        child: const SizedBox.shrink(),
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header
                      if (widget.title != null || widget.icon != null || widget.rightAction != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: isDark
                                    ? const Color(0xFF27272A).withValues(alpha: 0.5)
                                    : const Color(0xFFE5E7EB).withValues(alpha: 0.5),
                              ),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    if (widget.icon != null) ...[
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF689F38).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        alignment: Alignment.center,
                                        child: IconTheme(
                                          data: const IconThemeData(
                                            color: Color(0xFF689F38),
                                            size: 16,
                                          ),
                                          child: widget.icon!,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                    ],
                                    if (widget.title != null)
                                      Expanded(
                                        child: Text(
                                          widget.title!.toUpperCase(),
                                          style: TextStyle(
                                            color: isDark ? const Color(0xFFFAFAFA) : const Color(0xFF111827),
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            letterSpacing: 1.5,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              if (widget.rightAction != null) ...[
                                const SizedBox(width: 8),
                                widget.rightAction!,
                              ],
                            ],
                          ),
                        ),

                      // Content Body
                      Flexible(
                        child: Padding(
                          padding: widget.noPadding ? EdgeInsets.zero : const EdgeInsets.all(16),
                          child: widget.child,
                        ),
                      ),

                      // Footer
                      if (widget.hasFooter && widget.footerChild != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF27272A).withValues(alpha: 0.5)
                                : Colors.black.withValues(alpha: 0.05),
                            border: Border(
                              top: BorderSide(
                                color: isDark
                                    ? const Color(0xFF27272A).withValues(alpha: 0.5)
                                    : const Color(0xFFE5E7EB).withValues(alpha: 0.5),
                              ),
                            ),
                          ),
                          child: widget.footerChild!,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
