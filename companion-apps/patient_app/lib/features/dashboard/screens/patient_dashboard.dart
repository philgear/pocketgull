import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/models/patient.dart';

class PatientDashboard extends StatefulWidget {
  final Patient patient;
  const PatientDashboard({super.key, required this.patient});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  final ApiClient _apiClient = ApiClient();
  late Patient _currentPatient;
  bool _isLoading = false;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _currentPatient = widget.patient;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await _apiClient.fetchPatients();
    if (data.isNotEmpty && mounted) {
      final matching = data.where((json) => json['id'] == _currentPatient.id);
      if (matching.isNotEmpty) {
        setState(() {
          _currentPatient = Patient.fromJson(matching.first);
        });
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _simulateHealthSync() async {
    if (_currentPatient == null) return;
    setState(() => _isSyncing = true);

    // Simulate connecting to Apple Health / Health Connect
    // and pushing new vitals back to the web API
    final newVitals = {
      'hr': '72 bpm',
      'bp': '118/75',
      'steps': '6,240',
      'lastSync': DateTime.now().toIso8601String(),
    };

    final updates = {
      'vitals': newVitals,
    };

    // Keep existing state, just update vitals
    final fullState = _currentPatient!.state.toJson();
    fullState['vitals'] = {..._currentPatient!.state.vitals, ...newVitals};

    final success = await _apiClient.syncPatientData(_currentPatient!.id, {
      'vitals': fullState['vitals'],
    });

    setState(() => _isSyncing = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success 
            ? 'Successfully synced biometrics with Pocket Gull.' 
            : 'Failed to sync data.'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
      if (success) {
        _loadData(); // Reload to show updated data
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final cardColor = isDark ? const Color(0xFF27272A) : Colors.white;
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('MY CARE PLAN', style: TextStyle(letterSpacing: 2, fontSize: 14)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _currentPatient == null
              ? Center(child: Text('No patient data found.', style: TextStyle(color: textColor)))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView(
                    padding: const EdgeInsets.all(24.0),
                    children: [
                      Text(
                        'Hello, ${_currentPatient!.name.split(' ').first}',
                        style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: textColor),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Here is your latest clinical summary.',
                        style: TextStyle(fontSize: 16, color: subColor),
                      ),
                      const SizedBox(height: 32),
                      
                      // Active Issues
                      _buildSectionTitle('ACTIVE CONCERNS', textColor),
                      const SizedBox(height: 16),
                      ..._currentPatient!.state.issues.entries.map((entry) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.key.toUpperCase(),
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1, color: subColor),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${entry.value.length} flagged node(s)',
                                style: TextStyle(color: textColor),
                              ),
                            ],
                          ),
                        );
                      }).toList(),

                      const SizedBox(height: 32),

                      // Chart Update Recommendations (Patient Nudges)
                      _buildSectionTitle('RECOMMENDED ACTIONS', textColor),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF27272A).withOpacity(0.5) : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.favorite_border, color: textColor, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Connect Health App',
                                    style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Your doctor lacks recent activity data. Sync Apple Health or Google Health Connect to update your clinical chart automatically.',
                              style: TextStyle(height: 1.5, color: subColor, fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: textColor,
                                  foregroundColor: bgColor,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                ),
                                onPressed: _isSyncing ? null : _simulateHealthSync,
                                child: _isSyncing 
                                  ? SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: bgColor, strokeWidth: 2))
                                  : const Text('SYNC BIOMETRICS', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                              ),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
        color: color,
      ),
    );
  }
}
