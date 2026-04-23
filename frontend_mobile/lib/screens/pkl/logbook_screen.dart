import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:velocity_x/velocity_x.dart';

import '../../services/pkl_service.dart';
import '../../utils/constants.dart';

class LogbookScreen extends StatefulWidget {
  const LogbookScreen({super.key});

  @override
  State<LogbookScreen> createState() => _LogbookScreenState();
}

class _LogbookScreenState extends State<LogbookScreen> {
  List<dynamic> _logbooks = [];

  @override
  void initState() {
    super.initState();
    _fetchLogbook();
  }

  Future<void> _fetchLogbook() async {
    final pklService = Provider.of<PklService>(context, listen: false);
    final response = await pklService.getLogbookHarian();
    if (response.success && response.data != null) {
      if (mounted) {
        setState(() {
          _logbooks = response.data['data'] ?? [];
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<PklService>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: "Logbook Harian".text.make(),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Open modal or navigate to Create Logbook
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Add Logbook feature coming soon!')),
          );
        },
        backgroundColor: AppConstants.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: isLoading && _logbooks.isEmpty
          ? const CircularProgressIndicator(
              color: AppConstants.primaryColor,
            ).centered()
          : _logbooks.isEmpty
          ? VStack([
              const Icon(Icons.history, size: 80, color: Colors.grey),
              const SizedBox(height: 16),
              "No logbook entries found.".text.lg.gray500.make(),
            ]).centered()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _logbooks.length,
              itemBuilder: (context, index) {
                final item = _logbooks[index];
                return Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: VStack([
                      (item['tanggal'] ?? 'Unknown Date')
                          .toString()
                          .text
                          .color(AppConstants.primaryColor)
                          .bold
                          .make(),
                      const SizedBox(height: 8),
                      (item['kegiatan'] ?? 'No activity description')
                          .toString()
                          .text
                          .make(),
                      const SizedBox(height: 8),
                      HStack([
                        "Status: ".text.make(),
                        (item['status'] ?? 'PENDING')
                            .toString()
                            .text
                            .bold
                            .color(
                              item['status'] == 'APPROVED'
                                  ? AppConstants.successColor
                                  : AppConstants.warningColor,
                            )
                            .make(),
                      ]),
                    ]),
                  ),
                );
              },
            ),
    );
  }
}
