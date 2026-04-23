import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

// Import Screens (To be created)
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/public_home_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/pkl/logbook_screen.dart';

class AppRouter {
  static GoRouter getRouter(AuthService authService) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: authService,
      redirect: (context, state) {
        final isAuthenticated = authService.isAuthenticated;
        final isLoginRoute = state.matchedLocation == '/login';

        // If logged in and on login page, redirect to dashboard
        if (isAuthenticated && isLoginRoute) {
          return '/dashboard';
        }

        // Currently public home is default, login is optional.
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const PublicHomeScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/logbook',
          builder: (context, state) => const LogbookScreen(),
        ),
      ],
    );
  }
}
