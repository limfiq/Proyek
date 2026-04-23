import 'package:flutter/material.dart';

class AppConstants {
  // Use 10.0.2.2 for Android emulator to access localhost,
  // or use IP address of the machine for real device / iOS simulator
  static const String baseUrl = 'http://localhost:5000';
  // Update this to your local IP (e.g., 'http://192.168.1.5:5000') to test on physical device

  static const String apiPrefix = '/api';
  static const String authPrefix = '/auth';
  static const String publicPrefix = '/api/public';

  // API Endpoints
  static const String login = '$authPrefix/login';
  static const String registerStudent = '$authPrefix/register/mahasiswa';
  static const String me = '$authPrefix/me';

  static const String lowongan = '$publicPrefix/lowongan';
  static const String panduan = '$publicPrefix/panduan';

  static const String pklRegister = '$apiPrefix/pkl/register';
  static const String pklMe = '$apiPrefix/pkl/me';
  static const String logbookHarian = '$apiPrefix/laporan/harian';
  static const String logbookMingguan = '$apiPrefix/laporan/mingguan';

  // Colors
  static const Color primaryColor = Color(0xFF1E3A8A); // Blue 900
  static const Color accentColor = Color(0xFF3B82F6); // Blue 500
  static const Color backgroundColor = Color(0xFFF3F4F6); // Gray 100
  static const Color textColor = Color(0xFF1F2937); // Gray 800
  static const Color textLightColor = Color(0xFF6B7280); // Gray 500
  static const Color successColor = Color(0xFF10B981); // Emerald 500
  static const Color errorColor = Color(0xFFEF4444); // Red 500
  static const Color warningColor = Color(0xFFF59E0B); // Amber 500
}
