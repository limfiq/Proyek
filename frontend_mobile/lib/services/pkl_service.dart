import 'package:flutter/foundation.dart';
import 'api_service.dart';
import '../utils/constants.dart';

class PklService extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  Future<ApiResponse> getMyPendaftaran() async {
    _setLoading(true);
    final response = await _apiService.get(AppConstants.pklMe);
    _setLoading(false);
    return response;
  }

  Future<ApiResponse> getLogbookHarian() async {
    _setLoading(true);
    final response = await _apiService.get(AppConstants.logbookHarian);
    _setLoading(false);
    return response;
  }

  Future<ApiResponse> createLogbookHarian(Map<String, dynamic> data) async {
    _setLoading(true);
    // In a real scenario, handling multipart/form-data for images is needed
    // this wrapper assumes basic json for now or requires modification
    // to ApiService for Multipart requests.
    final response = await _apiService.post(AppConstants.logbookHarian, data);
    _setLoading(false);
    return response;
  }
}
