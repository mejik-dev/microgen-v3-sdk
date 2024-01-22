import 'dart:convert';

import 'package:microgen_v3_dart_sdk/src/microgen_v3_dart_sdk_base.dart';
import 'package:http/http.dart' as http;
import 'package:microgen_v3_dart_sdk/src/helpers/error_message.dart';

class DatabaseService {
  final Microgen _microgen;
  final String _table;
  late final String _baseUrl;

  DatabaseService._(this._microgen, this._table) {
    _baseUrl = '${_microgen.baseUrl}/$_table';
  }

  Future<dynamic> select() async {
    final url = Uri.parse(_baseUrl);

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    if (response.statusCode == 200) {
      final data = await response.stream.bytesToString();

      return jsonDecode(data);
    } else {
      return errorMsg(response.reasonPhrase);
    }
  }

  Future<dynamic> count() async {
    final url = Uri.parse('$_baseUrl/count');

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    if (response.statusCode == 200) {
      final data = await response.stream.bytesToString();

      return jsonDecode(data);
    } else {
      return errorMsg(response.reasonPhrase);
    }
  }

  Future<dynamic> byId(String id) async {
    if (id == "") {
      return errorMsg("id is required");
    }

    final url = Uri.parse('$_baseUrl/$id');

    final request = http.Request('GET', url);

    if (_microgen.token != null) {
      request.headers['Authorization'] = 'Bearer ${_microgen.token}';
    }

    final response = await http.Client().send(request);

    if (response.statusCode == 200) {
      final data = await response.stream.bytesToString();

      return jsonDecode(data);
    } else {
      return errorMsg(response.reasonPhrase);
    }
  }
}
