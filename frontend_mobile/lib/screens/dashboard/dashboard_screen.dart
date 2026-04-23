import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:velocity_x/velocity_x.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().currentUser;

    return Scaffold(
      appBar: AppBar(
        title: "Dashboard".text.make(),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
      ),
      drawer: Drawer(
        child: VStack([
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppConstants.primaryColor),
            accountName: (user?.nama ?? "User").text.bold.make(),
            accountEmail: (user?.email ?? "email@example.com").text.make(),
            currentAccountPicture: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(
                Icons.person,
                color: AppConstants.primaryColor,
                size: 40,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: "Dashboard".text.make(),
            onTap: () {
              context.pop(); // close drawer
            },
          ),
          if (user?.role == 'MAHASISWA') ...[
            ListTile(
              leading: const Icon(Icons.book),
              title: "Logbook Harian".text.make(),
              onTap: () {
                context.pop(); // close drawer
                context.push('/logbook');
              },
            ),
          ],
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppConstants.errorColor),
            title: "Logout".text.color(AppConstants.errorColor).bold.make(),
            onTap: () {
              context.read<AuthService>().logout();
            },
          ),
        ]),
      ),
      body: VStack([
        "Welcome back,".text.gray500.xl.make(),
        (user?.nama ?? "User").text.xl3.bold
            .color(AppConstants.primaryColor)
            .make()
            .box
            .padding(const EdgeInsets.only(bottom: 24))
            .make(),

        // Role based content could go here
        "Your Role: ${user?.role ?? 'Unknown'}".text.lg.make(),
      ]).p24().scrollVertical(),
    );
  }
}
