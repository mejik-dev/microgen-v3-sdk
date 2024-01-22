import 'package:microgen_v3_dart_sdk/src/services/database_service.dart';

class Microgen {
  final String apiKey;
  final String? token;

  Microgen({required this.apiKey, this.token}) {
    baseUrl = 'https://database-query.v3.microgen.id/api/v1/$apiKey';
  }

  late final String baseUrl;

  DatabaseService from(String table) {
    return DatabaseService._(this, table);
  }
}
