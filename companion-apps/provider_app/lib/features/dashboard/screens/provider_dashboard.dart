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

    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final bool isWatch = screenWidth < 240 || screenHeight < 320;
    final bool isSmallPhone = screenWidth < 360 || screenHeight < 640;

    final double listPadding = isWatch ? 4.0 : 8.0;
    final double tileHorizontalPadding = isWatch ? 8.0 : (isSmallPhone ? 16.0 : 24.0);
    final double tileVerticalPadding = isWatch ? 4.0 : (isSmallPhone ? 6.0 : 8.0);
    final double titleFontSize = isWatch ? 12.0 : (isSmallPhone ? 14.0 : 16.0);
    final double subtitleFontSize = isWatch ? 9.0 : (isSmallPhone ? 11.0 : 13.0);
    final double appBarTitleFontSize = isWatch ? 11.0 : 14.0;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text('PATIENT DIRECTORY', style: TextStyle(letterSpacing: 2, fontSize: appBarTitleFontSize)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        actions: [
          IconButton(
            iconSize: isWatch ? 16 : 24,
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _patients.isEmpty
              ? Center(child: Text('No patients found.', style: TextStyle(color: textColor, fontSize: titleFontSize)))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.separated(
                    padding: EdgeInsets.symmetric(vertical: listPadding),
                    itemCount: _patients.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1, 
                      color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)
                    ),
                    itemBuilder: (context, index) {
                      final patient = _patients[index];
                      return ListTile(
                        leading: Hero(
                          tag: 'avatar-${patient.id}',
                          child: CircleAvatar(
                            backgroundColor: getPatientAvatarColor(patient.id, isDark),
                            radius: isWatch ? 12 : 20,
                            child: Text(
                              getPatientInitials(patient.name),
                              style: TextStyle(
                                color: getPatientAvatarTextColor(patient.id, isDark),
                                fontWeight: FontWeight.bold,
                                fontSize: isWatch ? 9 : 14,
                              ),
                            ),
                          ),
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: tileHorizontalPadding, vertical: tileVerticalPadding),
                        title: Text(
                          patient.name,
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: titleFontSize, color: textColor),
                        ),
                        subtitle: Text(
                          'Age: ${patient.age} • Last Visit: ${patient.lastVisit}',
                          style: TextStyle(color: subColor, fontSize: subtitleFontSize),
                        ),
                        trailing: Icon(Icons.chevron_right, color: subColor, size: isWatch ? 16 : 24),
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

String getPatientInitials(String name) {
  if (name.isEmpty) return '';
  final parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

Color getPatientAvatarColor(String id, bool isDark) {
  final int hash = id.hashCode;
  final List<Color> darkColors = [
    const Color(0xFF1E3A8A), // Blue
    const Color(0xFF065F46), // Green
    const Color(0xFF701A75), // Purple
    const Color(0xFF7C2D12), // Orange/Rust
    const Color(0xFF1F2937), // Dark Gray
  ];
  final List<Color> lightColors = [
    const Color(0xFFDBEAFE), // Light Blue
    const Color(0xFFD1FAE5), // Light Green
    const Color(0xFFF3E8FF), // Light Purple
    const Color(0xFFFFEDD5), // Light Orange
    const Color(0xFFF3F4F6), // Light Gray
  ];
  final list = isDark ? darkColors : lightColors;
  return list[hash.abs() % list.length];
}

Color getPatientAvatarTextColor(String id, bool isDark) {
  final int hash = id.hashCode;
  final List<Color> darkTextColors = [
    const Color(0xFF93C5FD),
    const Color(0xFF6EE7B7),
    const Color(0xFFF5D0FE),
    const Color(0xFFFDBA74),
    const Color(0xFFE5E7EB),
  ];
  final List<Color> lightTextColors = [
    const Color(0xFF1E40AF),
    const Color(0xFF065F46),
    const Color(0xFF6B21A8),
    const Color(0xFF9A3412),
    const Color(0xFF374151),
  ];
  final list = isDark ? darkTextColors : lightTextColors;
  return list[hash.abs() % list.length];
}
