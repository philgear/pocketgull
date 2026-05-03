import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/models/patient.dart';
import 'patient_detail_screen.dart';

class ProviderDashboard extends StatefulWidget {
  const ProviderDashboard({super.key});

  @override
  State<ProviderDashboard> createState() => _ProviderDashboardState();
}

class _ProviderDashboardState extends State<ProviderDashboard> {
  final ApiClient _apiClient = ApiClient();
  List<Patient> _patients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await _apiClient.fetchPatients();
    setState(() {
      _patients = data.map((json) => Patient.fromJson(json)).toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('PATIENT DIRECTORY', style: TextStyle(letterSpacing: 2, fontSize: 14)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _patients.isEmpty
              ? Center(child: Text('No patients found.', style: TextStyle(color: textColor)))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    itemCount: _patients.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1, 
                      color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)
                    ),
                    itemBuilder: (context, index) {
                      final patient = _patients[index];
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        title: Text(
                          patient.name,
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor),
                        ),
                        subtitle: Text(
                          'Age: ${patient.age} • Last Visit: ${patient.lastVisit}',
                          style: TextStyle(color: subColor, fontSize: 13),
                        ),
                        trailing: Icon(Icons.chevron_right, color: subColor),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PatientDetailScreen(patient: patient),
                            ),
                          ).then((_) => _loadData()); // Refresh on return in case of changes
                        },
                      );
                    },
                  ),
                ),
    );
  }
}
