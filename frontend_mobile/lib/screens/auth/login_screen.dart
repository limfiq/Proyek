import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:velocity_x/velocity_x.dart';

import '../../services/auth_service.dart';
import '../../utils/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscureText = true;

  void _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      final authService = Provider.of<AuthService>(context, listen: false);

      final response = await authService.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );

      if (response.success && mounted) {
        // Router will automatically redirect to /dashboard via authService listener
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                response.message?.text.make() ?? "Login failed".text.make(),
            backgroundColor: AppConstants.errorColor,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthService>().isLoading;

    return Scaffold(
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: VStack([
            // Header Image or Logo
            const Icon(
              Icons.school,
              size: 80,
              color: AppConstants.primaryColor,
            ).box.alignCenter.make(),
            const SizedBox(height: 16),
            "SIMagang".text.xl3.bold
                .color(AppConstants.primaryColor)
                .center
                .make(),
            "Welcome back! Please login to your account.".text.gray500.center
                .make(),
            const SizedBox(height: 32),

            // Username Field
            "Username".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _usernameController,
              keyboardType: TextInputType.text,
              decoration: InputDecoration(
                hintText: "Enter your username",
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "Please enter your username";
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Password Field
            "Password".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _passwordController,
              obscureText: _obscureText,
              decoration: InputDecoration(
                hintText: "Enter your password",
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureText ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscureText = !_obscureText;
                    });
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "Please enter your password";
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Login Button
            ElevatedButton(
              onPressed: isLoading ? null : _handleLogin,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : "Login".text.xl.bold.make(),
            ),
            const SizedBox(height: 16),

            // Student Registration Link
            HStack([
              "Don't have an account? ".text.make(),
              "Register (Mahasiswa)".text
                  .color(AppConstants.primaryColor)
                  .bold
                  .make()
                  .onInkTap(() {
                    context.push('/register');
                  }),
            ]).centered(),
          ]).p32().scrollVertical(),
        ).centered(),
      ),
    );
  }
}
