import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_mobile/main.dart';
import 'package:frontend_mobile/services/auth_service.dart';

void main() {
  testWidgets('App basic initialization test', (WidgetTester tester) async {
    final mockAuthService = AuthService();

    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp(authService: mockAuthService));

    // Verify app starts
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
