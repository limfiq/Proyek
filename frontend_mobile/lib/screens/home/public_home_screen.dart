import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:velocity_x/velocity_x.dart';
import '../../utils/constants.dart';

class PublicHomeScreen extends StatelessWidget {
  const PublicHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: "Home".text.make(),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: () => context.push('/login'),
            child: "Login".text.white.bold.make(),
          ),
        ],
      ),
      body: VStack([
        "Welcome to PKL System".text.xl3.bold
            .color(AppConstants.primaryColor)
            .make(),
        "Find internship vacancies and guides below.".text.gray600
            .make()
            .box
            .margin(const EdgeInsets.only(bottom: 24))
            .make(),

        // Placeholder for Lowongan / Instansi
        "Active Vacancies".text.xl2.bold
            .make()
            .box
            .margin(const EdgeInsets.only(bottom: 16))
            .make(),

        // Use expanded to allow list to take remaining space
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 3, // Dummy count
          itemBuilder: (context, index) {
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: const Icon(Icons.business),
                title: "Perusahaan ${index + 1}".text.bold.make(),
                subtitle: "Posisi yang dibutuhkan...".text.make(),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              ),
            );
          },
        ).expand(),
      ]).p16(),
    );
  }
}
