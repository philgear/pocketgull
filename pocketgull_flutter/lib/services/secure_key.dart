/// Secure Key — API key storage with obfuscation.
///
/// Flutter parity with Angular `secure-key.ts` (27 lines).
/// Uses `flutter_secure_storage` for platform-native keychain/keystore
/// storage, with a base64+reverse obfuscation layer matching the
/// Angular implementation for cross-platform consistency.
library;

import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _storageKey = '_pg_g_ak';
const _storage = FlutterSecureStorage();

/// Retrieves the stored API key, deobfuscating it.
Future<String> getStoredApiKey() async {
  try {
    final raw = await _storage.read(key: _storageKey);
    if (raw == null || raw.isEmpty) return '';
    // Reverse and base64 decode to deobfuscate.
    final reversed = raw.split('').reversed.join('');
    return utf8.decode(base64Decode(reversed));
  } catch (_) {
    return '';
  }
}

/// Stores an API key with obfuscation.
Future<void> setStoredApiKey(String key) async {
  try {
    if (key.isEmpty) {
      await _storage.delete(key: _storageKey);
      return;
    }
    // Base64 encode and reverse to obfuscate.
    final obfuscated = base64Encode(utf8.encode(key)).split('').reversed.join('');
    await _storage.write(key: _storageKey, value: obfuscated);
  } catch (e) {
    // Silently fail — matches Angular behavior.
  }
}

/// Checks whether an API key is stored.
Future<bool> hasStoredApiKey() async {
  final key = await getStoredApiKey();
  return key.isNotEmpty;
}
