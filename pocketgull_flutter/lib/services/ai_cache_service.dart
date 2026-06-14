import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AiCacheService {
  static const int _maxEntries = 50;

  /// Generates a deterministic SHA-256 cache key from input components.
  String generateKey(List<dynamic> components) {
    final rawString = jsonEncode(components);
    final bytes = utf8.encode(rawString);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<T?> get<T>(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString('ai_cache_$key');
    
    if (jsonString == null) return null;

    try {
      final decoded = jsonDecode(jsonString) as Map<String, dynamic>;
      // Update last used time to implement LRU policy eventually
      decoded['lastUsed'] = DateTime.now().millisecondsSinceEpoch;
      await prefs.setString('ai_cache_$key', jsonEncode(decoded));

      return decoded['data'] as T;
    } catch (e) {
      debugPrint('Cache decryption/parse failed: $e');
      return null;
    }
  }

  Future<void> set(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    
    final entry = {
      'data': value,
      'lastUsed': DateTime.now().millisecondsSinceEpoch,
    };
    
    await prefs.setString('ai_cache_$key', jsonEncode(entry));
    await _vacuum();
  }

  Future<void> _vacuum() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys().where((k) => k.startsWith('ai_cache_')).toList();
    
    if (keys.length <= _maxEntries) return;

    final entries = <String, int>{};
    
    for (final k in keys) {
      final val = prefs.getString(k);
      if (val != null) {
        try {
          final decoded = jsonDecode(val) as Map<String, dynamic>;
          entries[k] = decoded['lastUsed'] as int;
        } catch (_) {}
      }
    }

    // Sort by oldest first
    final sortedKeys = entries.keys.toList()
      ..sort((a, b) => entries[a]!.compareTo(entries[b]!));

    final toDelete = sortedKeys.take(sortedKeys.length - _maxEntries);
    for (final k in toDelete) {
      await prefs.remove(k);
    }
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys().where((k) => k.startsWith('ai_cache_')).toList();
    for (final k in keys) {
      await prefs.remove(k);
    }
  }
}
