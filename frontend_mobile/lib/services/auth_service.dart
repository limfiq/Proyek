import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  UserModel? _currentUser;
  String? _token;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _currentUser != null;
  bool get isLoading => _isLoading;

  Future<bool> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');

    final userData = prefs.getString('user');
    if (userData != null) {
      _currentUser = UserModel.fromJson(jsonDecode(userData));
    }

    if (_token != null) {
      return await _fetchUserProfile();
    }
    return false;
  }

  Future<bool> _fetchUserProfile() async {
    final response = await _apiService.get(AppConstants.me);
    if (response.success && response.data != null) {
      _currentUser = UserModel.fromJson(response.data['user'] ?? response.data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(_currentUser!.toJson()));
      notifyListeners();
      return true;
    } else {
      await logout();
      return false;
    }
  }

  Future<ApiResponse> login(String username, String password) async {
    _setLoading(true);

    final response = await _apiService.post(AppConstants.login, {
      'username': username,
      'password': password,
    }, includeAuth: false);

    if (response.success && response.data != null) {
      _token = response.data['token'];
      _currentUser = UserModel.fromJson(response.data['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('user', jsonEncode(_currentUser!.toJson()));

      notifyListeners();
    }

    _setLoading(false);
    return response;
  }

  Future<ApiResponse> registerStudent(Map<String, dynamic> data) async {
    _setLoading(true);
    final response = await _apiService.post(
      AppConstants.registerStudent,
      data,
      includeAuth: false,
    );
    _setLoading(false);
    return response;
  }

  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
