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
