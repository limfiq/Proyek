import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:velocity_x/velocity_x.dart';

import '../../services/auth_service.dart';
import '../../utils/constants.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nimController = TextEditingController();
  final _namaController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscureText = true;

  void _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      final authService = Provider.of<AuthService>(context, listen: false);

      final data = {
        'nim': _nimController.text.trim(),
        'nama': _namaController.text.trim(),
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
        'prodiId': 1, // Dummy prodiId, ideally fetched from an API
      };

      final response = await authService.registerStudent(data);

      if (response.success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: "Registration successful. Please login.".text.make(),
            backgroundColor: AppConstants.successColor,
          ),
        );
        context.pop(); // Go back to login
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                response.message?.text.make() ??
                "Registration failed".text.make(),
            backgroundColor: AppConstants.errorColor,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _nimController.dispose();
    _namaController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthService>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: "Register Mahasiswa".text.make(),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppConstants.primaryColor,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: VStack([
            "Create an Account".text.xl3.bold
                .color(AppConstants.primaryColor)
                .make(),
            const SizedBox(height: 8),
            "Join as a student to manage your PKL/Internship.".text.gray500
                .make(),
            const SizedBox(height: 24),

            // NIM Field
            "NIM".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _nimController,
              decoration: InputDecoration(
                hintText: "Enter your Student ID (NIM)",
                prefixIcon: const Icon(Icons.badge_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) => v!.isEmpty ? "NIM is required" : null,
            ),
            const SizedBox(height: 16),

            // Nama Field
            "Full Name".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _namaController,
              decoration: InputDecoration(
                hintText: "Enter your full name",
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) => v!.isEmpty ? "Name is required" : null,
            ),
            const SizedBox(height: 16),

            // Email Field
            "Email".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: "Enter your email address",
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) => v!.isEmpty ? "Email is required" : null,
            ),
            const SizedBox(height: 16),

            // Password Field
            "Password".text.bold.make(),
            const SizedBox(height: 8),
            TextFormField(
              controller: _passwordController,
              obscureText: _obscureText,
              decoration: InputDecoration(
                hintText: "Create a password",
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureText ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () => setState(() => _obscureText = !_obscureText),
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) => v!.length < 6
                  ? "Password must be at least 6 characters"
                  : null,
            ),
            const SizedBox(height: 24),

            // Register Button
            ElevatedButton(
              onPressed: isLoading ? null : _handleRegister,
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
                  : "Register".text.xl.bold.make(),
            ),
          ]).p24().scrollVertical(),
        ).centered(),
      ),
    );
  }
}
